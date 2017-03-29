import tornado.ioloop
import tornado.web
import motor.motor_tornado
import os
import tornado.escape
import json
import urllib.parse
import tornado.httpserver
import ssl
import datetime

db = motor.motor_tornado.MotorClient().Bilirubin

class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("User")

class LoginHandler(BaseHandler):
    """Login Page"""
    def get(self):
        if not self.current_user:
            self.render("login.html")
        else:
            self.redirect("/Index")
    
    # Have to use async since the database call is asynchronous.
    async def post(self):
        data = tornado.escape.json_decode(self.request.body)
        username = data["username"]
        password = data["password"]
        document = await db.patients.find_one({"username":username, "password":password})

        # Need to add cookies or another authentication method
        if document != None:
            self.set_secure_cookie("User", username)
            self.set_cookie("username", str(document["username"]).replace(" ", "|"))
            self.set_cookie("name", str(document["name"]).replace(" ", "|"))
            self.set_cookie("hospital", str(document["hospital"]).replace(" ", "|"))
            self.set_cookie("hospitalAddress", str(document["hospitalAddress"]).replace(" ", "|"))
            self.set_cookie("city", str(document["city"]).replace(" ", "|"))
            response = {"LoggedIn":"True"}
            self.write(json.dumps(response))
        else:
            response = {"LoggedIn":"False"}
            self.write(json.dumps(response))

class IndexHandler(BaseHandler):
    """Index Page"""
    @tornado.web.authenticated
    def get(self):
        self.render("index.html")

class SearchByBiliHandler(tornado.web.RequestHandler):
    async def get(self):
        data = urllib.parse.parse_qs(self.request.query)
        num1 = float(data["num1"][0])
        num2 = float(data["num2"][0])
        cursor = db.patients.find({"bilirubin":{"$gt":num1, "$lt":num2}})
        document = await cursor.to_list(length=100)
        print(document)

class SearchByNameHandler(tornado.web.RequestHandler):
    async def get(self):
        data = urllib.parse.parse_qs(self.request.query)
        name = str(data["name"][0]).strip()
        document = await db.patients.find_one({"name":name})
        print(document)

class SearchByIdHandler(tornado.web.RequestHandler):
    async def get(self):
        data = urllib.parse.parse_qs(self.request.query)
        num = int(data["idNum"][0])
        document = await db.patients.find_one({"id":num})
        print(document)

class SearchByEthnicityHandler(tornado.web.RequestHandler):
    async def get(self):
        data = urllib.parse.parse_qs(self.request.query)
        ethnicities = [x.title() for x in data["ethnicities[]"]]
        cursor = db.patients.find({"ethnicity":{"$in":ethnicities}})
        document = await cursor.to_list(length=100)
        print(document)

class SearchByDateHandler(tornado.web.RequestHandler):
    async def get(self):
        data = urllib.parse.parse_qs(self.request.query)
        date1 = data["date1"][0]
        date2 = data["date2"][0]
        # In MongoDB, db.YOURCOLLECTION.update({"username":A NAME}, {$set:{"date":new Date("YYYY-MM-DD")}})
        # Or simply insert new accounts with the new Date object. First db.YOURCOLLECTION.remove({}) to delete ALL documents in the collection
        date1 = datetime.datetime.strptime(date1, "%m/%d/%Y")
        date2 = datetime.datetime.strptime(date2, "%m/%d/%Y")
        cursor = db.patients.find({"date":{"$gt":date1, "$lt":date2}})
        document = await cursor.to_list(length=100)
        print(document)

class AccountHandler(BaseHandler):
    def get(self):
        username = self.get_cookie("username").replace("|", " ")
        name = self.get_cookie("name").replace("|", " ")
        hospital = self.get_cookie("hospital").replace("|", " ")
        address = self.get_cookie("hospitalAddress").replace("|", " ")
        city = self.get_cookie("city").replace("|", " ")
        self.render("account.html", Username=username, Name=name, Hospital=hospital, Address=address, City=city)

class EditUserHandler(BaseHandler):
    async def put(self):
        data = tornado.escape.json_decode(self.request.body)
        username = data["username"]
        name = data["name"]
        hospital = data["hospital_name"]
        hospitalAddress = data["hospital_address"]
        city = data["hospital_city"]
        old_username = self.get_cookie("username").replace("|", " ")
        document = await db.patients.update_one({"username":old_username}, {"$set":{"username":username, "name":name, "hospital":hospital, "hospitalAddress":hospitalAddress, "city":city}})
        self.set_cookie("username", username.replace(" ", "|"))
        self.set_cookie("name", name.replace(" ", "|"))
        self.set_cookie("hospital", hospital.replace(" ", "|"))
        self.set_cookie("hospitalAddress", hospitalAddress.replace(" ", "|"))
        self.set_cookie("city", city.replace(" ", "|"))
        response = {"Username":username}
        self.write(json.dumps(response))

class ChangePasswordHandler(BaseHandler):
    async def put(self):
        data = tornado.escape.json_decode(self.request.body)
        password = data["password"]
        username = self.get_cookie("username").replace("|", " ")
        document = await db.patients.update_one({"username":username}, {"$set":{"password":password}})
        response = {"Username":username}
        self.write(json.dumps(response))

class LogoutHandler(tornado.web.RequestHandler):
    def get(self):
        self.clear_cookie("User")
        self.redirect("/")

settings = {
    "template_path":os.path.dirname(os.path.realpath(__file__)) + "\\website\\",
    "static_path":os.path.dirname(os.path.realpath(__file__)) + "\\website\\assets\\",
    "debug":True,
    "cookie_secret":os.urandom(32),
    "login_url":"/"
}

ssl_ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
# .crt = Certificate and .key = private key
ssl_ctx.load_cert_chain("server.crt", "server.key")

app = tornado.web.Application([
    (r"/", LoginHandler),
    (r"/Index", IndexHandler),
    (r"/SearchByBili", SearchByBiliHandler),
    (r"/SearchByName", SearchByNameHandler),
    (r"/SearchById", SearchByIdHandler),
    (r"/SearchByEthnicity", SearchByEthnicityHandler),
    (r"/SearchByDate", SearchByDateHandler),
    (r"/Account", AccountHandler),
    (r"/EditUser", EditUserHandler),
    (r"/ChangePassword", ChangePasswordHandler),
    (r"/Logout", LogoutHandler),
], db=db, **settings)

if __name__ == "__main__":
    server = tornado.httpserver.HTTPServer(app, ssl_options=ssl_ctx)
    server.listen(8888)
    tornado.ioloop.IOLoop.current().start()