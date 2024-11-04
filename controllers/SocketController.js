// controllers/SocketController.js
const Chat = require('../models/Chat');
const DateTimeHelper = require('../helpers/DateTimeHelper');

module.exports = async (io) => {
    io.on('connection', async (socket) => {
        console.log('User connected to socket.');

        socket.on('user_chat_init', async (data) => {
            const { from_user_id, to_user_id } = data;
            const room = `user_chat_${from_user_id}_${to_user_id}`;
            socket.join(room);
            console.log(`User joined room: ${room}`);
        });

        socket.on('user_chat_message', async (data) => {
            let insert_message = {
                from_user_id: data.from_user_id,
                to_user_id: data.to_user_id,
                message: data.message,
                status: 1,
                created_at: await DateTimeHelper.formatDate("", ""),
                updated_at: await DateTimeHelper.formatDate("", "")
            };
            let message_id = (await Chat.createMessage(insert_message))[0];
            let post_data = {};
            post_data.message_id = message_id;
            let message = await Chat.getMessageByMessageId(post_data);
            const room = `user_chat_${data.from_user_id}_${data.to_user_id}`;
            io.to(room).emit('new_message', message);
        });

        socket.on('disconnect', async () => {
            console.log('User disconnected from socket.');
        });
    });
};
