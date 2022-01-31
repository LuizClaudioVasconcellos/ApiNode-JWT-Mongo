const mongoose = require('../../database/connection');
const bcrypt = require('bcryptjs');

const ProjectSchema = new mongoose.Schema({
    totle: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

ProjectSchema.pre('save', async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;