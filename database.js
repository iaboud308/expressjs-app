const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const bcryptjs = require('bcryptjs');

let mongoUser;
let mongoPassword;

if (process.env.NODE_ENV === undefined) {
   const config = require('./config');
   mongoUser = config.mongoUser,
   mongoPassword = config.mongoPassword

} else if (process.env.NODE_ENV === 'production') {
    mongoUser = process.env.mongoUser,
    mongoPassword = process.env.mongoPassword;
}


const mongoUrl = `mongodb://rooty:123456@hyderion.com:27017/?authMechanism=DEFAULT`;
console.log(mongoUrl);

let db = null;
const client = new MongoClient (mongoUrl, { useUnifiedTopology: true } );

function connectToMongo (mongoFunction) {
    client.connect( (error, result) => {
        if (error) {
            console.log('There is an error')
        } else {
            console.log('Mongo Connected');
            db = result.db();
            mongoFunction();
        }
    })
}

connectToMongo ( () => {
    console.log('Initialised Connection');
});

function getDb (mongoFunction) {
    if (db === null) {
        connectToMongo (mongoFunction);
    } else {
        mongoFunction();
    }
}


// User Specific Functions

function getAllUsers (callback) {
    getDb ( () => {
        db.collection('users').find({}).toArray( (error, data) => {
            if (error) {
                callback(error);
            } else {
                callback(data)
            }
        })
    })
}


function getUser (id, callback) {
    getDb ( () => {
        db.collection('users').find({_id: id}).toArray( (error, data) => {
            if (error) {
                callback (error);
            } else {
                callback(data);
            }
        })
    })
}

function saveUser (user, callback) {
    getDb( () => {
        db.collection('users').findOne({email: user.email}, (error, result) => {
               if (error) {
                   callback ('Error');
               } else if (result !== null) {
                callback ('User Exists');
               } else {
                user.password = bcryptjs.hash(user.password, 12).then ( (encryptedPassword) => {
                    db.collection('users').insertOne({firstName: user.firstName, lastName: user.lastName, password: encryptedPassword, email: user.email, userStatus: user.userStatus});
                    callback('User Added');
                }).catch ( (error) => {
                    callback('Error');
                })  
            }
        }) 
    })    
}



function loginUser (loggingInUser, callback) {
    getDb ( () => {
        db.collection('users').findOne({email: loggingInUser.email}, (error, registeredUser) => {
            if (registeredUser === null) {
                callback (null, 'Invalid Email');
            } else {
                bcryptjs.compare(loggingInUser.password, registeredUser.password)
                .then ( (value) => {
                    if (value === true) {
                        callback (registeredUser, 'User Logged In');
                    } else {
                        callback (false, 'Incorrect Password');
                    }
                }).catch ( (error) => {
                    callback (error, 'Something Went Wrong');
                })

            }
        })
    })
}




function updateUser (user, callback) {
    getDb( () => {
        db.collection('users').updateOne({_id: user.Id}, {$set: {firstName: user.firstName, lastName: user.lastName, age: user.age, email: user.email}}, (error, data) => {
            let message;
            if(error) {
                message = 'There is an error';
            } else {
                message = 'Update Complete';
            }
            callback(message);
        
        })
    })
}


function deleteUser (userId, callback) {
    getDb ( () => {
        db.collection('users').deleteOne({_id: userId}, (error, result) => {
            let message;
            if (error) {
                message = 'Sorry Theres an Error';
            } else if (result.deletedCount === 0) {
                message = 'Sorry That User Could Not Be Deleted';
            } else {
                message = 'User Deleted';
            }
            callback(message);
        });
    })
}


// Post Specific Functions
function savePost (post, callback) {
    getDb ( () => { 
       
        db.collection('posts').findOne({title: post.title, body: post.body, userId: post.user._id}, (error, result) => {
            let message;
            if (error) {
                message = "There's An Error";
            } else if (result !== null) {
                message = 'Sorry This Post Already Exists';
            } else {
                db.collection('posts').insertOne({title: post.title, body: post.body, userId: post.user._id}, (error, result) => {
                    message = 'Post Saved';
                })
            }
            callback (message);
        })
        
    })
}


const defaultUser = {
    _id: 'Default Id',
    firstName: 'Default',
    lastName: 'Default',
    password: 'DefaultPassword',
    email: 'default@default.com'
}


function getAllPosts (callback) {
    getDb ( () => {
        db.collection('posts').find({}).toArray ( (error, documents) => {
            if (error) {
                callback ({"message": "There Is An Error"});
            }
            let postsWithUsers = [];
            for (let i = 0; i < documents.length; i++) {
                let userId = ObjectId (documents[i].userId);
                db.collection('users').findOne({_id: userId}, (error, user) => {
                    if (user === null) {
                        user = defaultUser;
                    }
                    postsWithUsers.push(documents[i]);
                    postsWithUsers.push(user);
                    if (postsWithUsers.length === (2 * documents.length)) {
                        callback (postsWithUsers);
                    }
                })
            }
        })
    })
}




function getPost (postId, callback) {
    getDb ( () => {
        postId = ObjectId(postId);
        db.collection('posts').findOne({_id: postId}, (error, result) => {
            let message;
            if (error) {
                message = 'There Is An Error';
            } else {
                callback(result);
            }
        })
    })
}


function updatePost (post, callback) {
    post._id = ObjectId(post._id);
    getDb ( () => {
        db.collection('posts').updateOne({_id: post._id}, {$set: {title: post.title, body: post.body, userId: post.userId}}, (error, result) => {
            let message;
            if (error) {
                message = 'There is some sort of error. Please Investigate';
            } else {
                message = 'Update Successfull';
            }
            callback(message);
        })
    })
}


function deletePost (postId, callback) {
    postId = ObjectId(postId);
    getDb ( () => {
        db.collection('posts').deleteOne({_id: postId}, (error, result) => {
            let message;
            if (error) {
                message = 'There Is An Error';
            } else if (result.deletedCount === 0) {
                message = 'Unable To Delete Post';
            } else {
                message = 'Post Deleted';
            }
            callback(message);
        })
    })
}




module.exports.getAllUsers = getAllUsers;
module.exports.getUser = getUser;
module.exports.saveUser = saveUser;
module.exports.loginUser = loginUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;

module.exports.savePost = savePost;
module.exports.getAllPosts = getAllPosts;
module.exports.getPost = getPost;
module.exports.updatePost = updatePost;
module.exports.deletePost = deletePost;

module.exports.getDb = getDb;
module.exports.connectToMongo = connectToMongo;
module.exports.db = db;
