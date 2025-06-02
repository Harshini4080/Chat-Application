const express = require('express')
const { Server } = require('socket.io')
const http  = require('http')
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { ConversationModel, MessageModel } = require('../models/ConversationModel')
const getConversation = require('../helpers/getConversation')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})

const onlineUser = new Set()

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id)

  const token = socket.handshake.auth.token
  if (!token) {
    console.log('No token provided, disconnecting socket:', socket.id)
    return socket.disconnect()
  }

  const user = await getUserDetailsFromToken(token)
  if (!user) {
    console.log('Invalid token, disconnecting socket:', socket.id)
    return socket.disconnect()
  }

  const userIdStr = user._id.toString()
  socket.join(userIdStr)
  onlineUser.add(userIdStr)

  io.emit('onlineUser', Array.from(onlineUser))

  // Handle message page load
  socket.on('message-page', async (userId) => {
    const userDetails = await UserModel.findById(userId).select('-password')
    if (!userDetails) {
      return socket.emit('message-user', null)
    }
    const payload = {
      _id: userDetails._id.toString(),
      name: userDetails.name,
      email: userDetails.email,
      profile_pic: userDetails.profile_pic,
      online: onlineUser.has(userId)
    }
    socket.emit('message-user', payload)

    // Get conversation messages
    const conversation = await ConversationModel.findOne({
      $or: [
        { sender: user._id, receiver: userId },
        { sender: userId, receiver: user._id }
      ]
    }).populate('messages').sort({ updatedAt: -1 })

    socket.emit('message', conversation?.messages || [])
  })

  // Handle new message
  socket.on('new message', async (data) => {
    // Validate required data
    if (!data.sender || !data.receiver || !data.text) {
      return
    }

    const senderStr = data.sender.toString()
    const receiverStr = data.receiver.toString()

    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender }
      ]
    })

    if (!conversation) {
      conversation = await new ConversationModel({
        sender: data.sender,
        receiver: data.receiver
      }).save()
    }

    const message = new MessageModel({
      text: data.text,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      msgByUserId: data.msgByUserId
    })
    const savedMessage = await message.save()

    await ConversationModel.updateOne(
      { _id: conversation._id },
      { $push: { messages: savedMessage._id } }
    )

    const updatedConversation = await ConversationModel.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender }
      ]
    }).populate('messages').sort({ updatedAt: -1 })

    // Emit to sender and receiver rooms
    io.to(senderStr).emit('message', updatedConversation?.messages || [])
    io.to(receiverStr).emit('message', updatedConversation?.messages || [])

    // Emit updated conversation list
    const conversationSender = await getConversation(senderStr)
    const conversationReceiver = await getConversation(receiverStr)

    io.to(senderStr).emit('conversation', conversationSender)
    io.to(receiverStr).emit('conversation', conversationReceiver)
  })

  // Handle sidebar conversation load
  socket.on('sidebar', async (currentUserId) => {
    const conversation = await getConversation(currentUserId)
    socket.emit('conversation', conversation)
  })

  // Handle seen messages
  socket.on('seen', async (msgByUserId) => {
    const conversation = await ConversationModel.findOne({
      $or: [
        { sender: user._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user._id }
      ]
    })

    if (!conversation) return

    const conversationMessageIds = conversation.messages || []

    await MessageModel.updateMany(
      { _id: { $in: conversationMessageIds }, msgByUserId },
      { $set: { seen: true } }
    )

    const conversationSender = await getConversation(user._id.toString())
    const conversationReceiver = await getConversation(msgByUserId)

    io.to(user._id.toString()).emit('conversation', conversationSender)
    io.to(msgByUserId).emit('conversation', conversationReceiver)
  })

  socket.on('disconnect', () => {
    onlineUser.delete(userIdStr)
    console.log('User disconnected:', socket.id)
    io.emit('onlineUser', Array.from(onlineUser))
  })
})

module.exports = { app, server }
