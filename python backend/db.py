# from pymongo import MongoClient
# from werkzeug.security import generate_password_hash
# import uuid
# # from user import User

# client = MongoClient("mongodb://localhost:27017/")

# db = client.get_database("information_card")
# user_db = db["Users"]
# chat_db = db["Chats"]

# def save_user(username, password, userDisplayName, id=str(uuid.uuid4())):
#     password_hash = generate_password_hash(password)
#     user_db.insert_one({
#         "password": password_hash,
#         "userDisplayName" : userDisplayName,
#         "username":username,
#         "user_id" : id,
#         "profilePictureURL" : ""
#     })  

# def get_user(username):
#     user_data = user_db.find_one({"userName":username})
#     return User(user_data['username'], user_data['password'], user_data['userDisplayName'], user_data['user_id'], user_data['profilePictureURL']) if user_data else None

# save_user("hyou", "test", "Henry You")
