const express = require('express');

const ObjectId = require('mongodb').ObjectID;

const database = require('./database');

const router = express.Router();



router.use( (request, response, next) => {
    if (request.session.loggedIn === undefined) {
        request.session.user = null;
        request.session.loggedIn = false;
    }
    console.log(request.session);
    next ();
})



// User Routes
router.get('/api/users/', (request, response, next) => {
    database.getAllUsers( (users) => {
            let data = {
            users: users,
            session: request.session,
            sessionId: request.sessionID
        }
        response.send(data);
    });
   
});



// router.get('/api/users/:userId', (request, response, next) => {
//     id = ObjectId(request.params.userId);
//     database.getUser(id, (result) => {
//         let data = {
//             result: result,
//             session: request.session
//         }
//         response.send(data);
//     });
// })


router.post('/api/users/login', (request, response, next) => {
    let user = request.body;
    // console.log(user);
    database.loginUser (user, (registeredUser, message) => {
        if (registeredUser) {
            request.session.loggedIn = true;
            request.session.user = registeredUser;

        } else {
            request.session.loggedIn = false;
        }
        let data = {
            message: message,
            session: request.session,
            sessionId: request.sessionID
        }
        console.log(data.message);
        console.log(data.session)
        response.json(data);
        
    })
})

//------------------------------------------------------------------------------------------------------------------------------------------------------
// router.get('/api/users/login/:user', (request, response, next) => {
//     let user = request.params.user;
//     request.session.user = user;
//     request.session.loggedIn = true;

//     let data = {
//         user: request.session.user,
//         status: request.session.loggedIn
//     }

    // database.saveSessionToDatabase(request.session, (error, result) => {
        // response.send(request.session);
    // })
// })


router.get('/api/users/logout', (request, response, next) => {
    
    // request.session.destroy( () => {
    //     response.send('You are now logged out');
    // })
    // database.endSession(sessionId, (error, result) => {
        // request.session.user = null;
        // request.session.loggedIn = false;
        let session = {
            user: request.session.user,
            loggedIn: request.session.loggedIn
        }
        console.log(session);
        response.send(session);
    // })
    
    
})

//------------------------------------------------------------------------------------------------------------------------------------------------------



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
            session: request.session
        }
        response.send(message);
    })
    console.log(post);
})


router.get('/api/posts/', (request, response, next) => {
        database.getAllPosts( (posts) => {
            let data = {
                posts: posts,
                session: request.session
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
    database.updatePost (post, (result) => {
    })
})


router.delete('/api/posts/delete', (request, response, next) => {
    postId = ObjectId(request.body._id);
    database.deletePost(postId, (message) => {
        response.send(message);
    })
})



module.exports.router = router;