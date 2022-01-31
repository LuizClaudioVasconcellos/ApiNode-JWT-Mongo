const mongoose = require('../../database/connection');
const bcrypt = require('bcryptjs');

const TaskSchema = new mongoose.Schema({
    totle: {
        type: String,
        require: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        require: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    completed: {
        type: Boolean,
        require: true,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

TaskSchema.pre('save', async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;