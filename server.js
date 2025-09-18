const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const farmers = new Set();
const admins = new Set();

// In-memory product store (for example purposes only)
let products = [];

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('join', role => {
    socket.role = role;
    if (role === 'farmer') {
      farmers.add(socket.id);
      console.log(`Farmer joined: ${socket.id}`);
    } else if (role === 'admin') {
      admins.add(socket.id);
      console.log(`Admin joined: ${socket.id}`);
      // Send current products to admin on join
      io.to(socket.id).emit('product list', products);
    }
  });

  socket.on('chat message', msg => {
    console.log(`Message from ${socket.id} (${socket.role}):`, msg);
    if (socket.role === 'farmer') {
      admins.forEach(adminId => {
        io.to(adminId).emit('chat message', { from: 'farmer', text: msg });
      });
    } else if (socket.role === 'admin') {
      farmers.forEach(farmerId => {
        io.to(farmerId).emit('chat message', { from: 'admin', text: msg });
      });
    }
  });

  // 🔥 Add this: Handle product deletion
  socket.on('delete product', productIndex => {
    if (socket.role === 'admin') {
      console.log(`Admin ${socket.id} requested to delete product at index: ${productIndex}`);
      if (products[productIndex]) {
        products.splice(productIndex, 1);
        // Notify all admins with updated list
        admins.forEach(adminId => {
          io.to(adminId).emit('product list', products);
        });
      }
    }
  });

  // 🆕 Optional: Add product from admin
  socket.on('add product', product => {
    if (socket.role === 'admin') {
      products.push(product);
      admins.forEach(adminId => {
        io.to(adminId).emit('product list', products);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.role === 'farmer') farmers.delete(socket.id);
    if (socket.role === 'admin') admins.delete(socket.id);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server listening on port 3000');
});
