const express = require('express');

const ObjectId = require('mongodb').ObjectID;

const database = require('./database');

const router = express.Router();


// User Routes
router.get('/api/users/', (request, response, next) => {
    database.getAllUsers( (users) => {
            let data = {
            users: users,
        }
        response.send(data);
    });
   
});



router.get('/api/users/:userId', (request, response, next) => {
    id = ObjectId(request.params.userId);
    database.getUser(id, (result) => {
        let data = {
            result: result
        }
        response.send(data);
    });
})


// Login function goes here....


router.post('/api/users/add', (request, response, next) => {
    let user = request.body;
    database.saveUser(user, (message) => {
        response.send(message);
    })
})

router.put('/api/users/update', (request, response, next) =>{
    user = request.body;
    user.Id = ObjectId(user._id);
    database.updateUser (user, (message) => {
        response.send(message);
        console.log(message);
    })
    
})

router.delete('/api/users/delete', (request, response, next) => {
    userId = request.body.id;
    userId = ObjectId(userId);
    database.deleteUser(userId, (message) => {
        response.send(message);
    })
})




// Post Routes


router.post('/api/posts/add', (request, response, next) => {
    const post = request.body;
    database.savePost(post, (message) => {
        let data = {
            message: message,
        }
        response.send(data);
    })
})


router.get('/api/posts/', (request, response, next) => {
        database.getAllPosts( (posts) => {
            let data = {
                posts: posts
            }
            response.send(data);
        })
})


router.get('/api/posts/:postId', (request, response, next) => {
    const postId = ObjectId (request.params.postId);
    database.getPost(postId, (result) => {
        response.send(result);
    })
})


router.put('/api/posts/update', (request, response, next) => {
    post = request.body;
    database.updatePost (post, (message) => {
        response.send(message);
    })
})


router.delete('/api/posts/delete', (request, response, next) => {
    postId = ObjectId(request.body._id);
    database.deletePost(postId, (message) => {
        response.send(message);
    })
})



module.exports.router = router;