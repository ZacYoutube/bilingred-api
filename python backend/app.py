from socket import socket
from flask import Flask, render_template, request, jsonify, session
from xarray import broadcast
from flask_socketio import SocketIO, send
from flask_cors import CORS
from flask_pymongo import PyMongo, ObjectId
from flask_login import LoginManager
# from db import get_user
# import bcrypt



app = Flask(__name__)
#connect to mongodb after installation
app.config['MONGO_URI']='mongodb://localhost:27017/information_card'

# login_manager = LoginManager()
# LoginManager.init_app(app)

socketIo = SocketIO(app, cors_allowed_origins="*")
app.debug = True
# app.host = 'localhost'

mongo = PyMongo(app)

CORS(app)
deck = mongo.db.Decks
card = mongo.db.Cards

# from user import routes

#get all the cards related to the decks
@app.route("/", methods=["GET","POST"])
def home():
    if request.method == "GET":
        res = deck.aggregate([
                {
                "$lookup": {
                    "from": "Cards",
                    "localField": "deck_id",
                    "foreignField": "deck_id",
                    "as": "deck_cards",        
                }
            }
        ])
        o = []
        for i in res:
            o.append({"_ID":str(ObjectId(i["_id"])),"deck_name":i["deck_name"], "deck_cards":str(i["deck_cards"])})           
        return jsonify(o)

    elif request.method == "POST":
        card.insert_one({"cardDisplayPictureURL":request.json["cardDisplayPictureURL"],"cardDisplayTags":request.json["cardDisplayTags"],"cardPublishDate":request.json["cardPublishDate"], "deck_id":request.json["deck_id"], "user_id":request.json["user_id"]})
        return "added!"


@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        pass
    return render_template


#delete or update the card
@app.route('/<id>',methods=["DELETE","PUT"])  
def deleteput(id):
    if request.method == "DELETE":
        card.delete_one({"_id":ObjectId(id)})
        return jsonify({"message":"deleted"})
    elif request.method == "PUT":
        card.update_one({"_id":ObjectId(id)},{"$set":{
            "cardDisplayPictureURL":request.json["cardDisplayPictureURL"],
            "cardDisplayTags":request.json["cardDisplayTags"],
        }})
        return jsonify({"message":"updated"})

#get one card
@app.route('/getcard/<id>',methods=["GET"])
def getone(id):
    res = card.find_one({"_id":ObjectId(id)})
    print(res)
    return jsonify({"_ID":str(ObjectId(res["_id"])),"cardDisplayPictureURL":res["cardDisplayPictureURL"],"cardDisplayTags":res["cardDisplayTags"],"cardPublishDate":res["cardPublishDate"], "deck_id":res["deck_id"], "user_id":res["user_id"]})


@socketIo.on("message")
def handleMessage(msg):
    print(msg)
    send(msg, broadcast=True)
    return None

# @login_manager.user_loader
# def load_user(username):
#     return get_user(username)


if __name__ == '__main__':
    socketIo.run(app)
    # app.run(debug=True)


