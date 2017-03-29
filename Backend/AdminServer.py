import tornado.ioloop
import tornado.web
import motor.motor_tornado
import os
import tornado.escape
import json
import urllib.parse
import tornado.httpserver
import ssl

db = motor.motor_tornado.MotorClient().bili


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("Admin")

class CreateUser(BaseHandler):
    """Create User"""
    @tornado.web.authenticated
    def get(self):
        self.render("admin_create_user.html")
    # Have to use async since the database call is asynchronous.
    async def post(self):
        data = tornado.escape.json_decode(self.request.body)
        username = data["username"]
        password = data["password"]
        name = data["name"]
        hospital = data["hospital"]
        hospitalAddress = data["hospitalAddress"]
        city = data["city"]
        document = await db.doctors.insert_one(
            {"username": username, "password": password, "name": name, "hospital": hospital,
             "hospitalAddress": hospitalAddress, "city": city})
        if document != None:
            response = {"CreatedUser": "True"}
            self.write(json.dumps(response))

class SearchByUserHandler(BaseHandler):
    """Search by User"""
    async def get(self):
        data = urllib.parse.parse_qs(self.request.query)
        username = data["dr_username"][0]
        document = await db.doctors.find_one({"username":username})
        if document != None:
            dataToSend = {"username": document["username"], "name": document["name"]}
            self.set_cookie("username", str(document["username"]).replace(" ", "|"))
            self.set_cookie("name", str(document["name"]).replace(" ", "|"))
            self.set_cookie("hospital", str(document["hospital"]).replace(" ", "|"))
            self.set_cookie("hospitalAddress", str(document["hospitalAddress"]).replace(" ", "|"))
            self.set_cookie("city", str(document["city"]).replace(" ", "|"))
            self.write(json.dumps(dataToSend))

class SearchByNameHandler(BaseHandler):
    async def get(self):
        data = urllib.parse.parse_qs(self.request.query)
        name = data["name"][0]
        document = await db.doctors.find_one({"name":name})
        if document != None:
            dataToSend = {"username": document["username"], "name": document["name"]}
            self.set_cookie("username", str(document["username"]).replace(" ", "|"))
            self.set_cookie("name", str(document["name"]).replace(" ", "|"))
            self.set_cookie("hospital", str(document["hospital"]).replace(" ", "|"))
            self.set_cookie("hospitalAddress", str(document["hospitalAddress"]).replace(" ", "|"))
            self.set_cookie("city", str(document["city"]).replace(" ", "|"))
            self.write(json.dumps(dataToSend))

class AccountInfoHandler(BaseHandler):
    """Account Info"""
    @tornado.web.authenticated
    def get(self):
        if self.get_cookie("Checked") == "Yes":
            self.redirect("/Index")
            return
        username = self.get_cookie("username").replace("|", " ")
        name = self.get_cookie("name").replace("|", " ")
        hospital = self.get_cookie("hospital").replace("|", " ")
        address = self.get_cookie("hospitalAddress").replace("|", " ")
        city = self.get_cookie("city").replace("|", " ")
        self.render("admin_account_info.html", Username = username, Name = name, Hospital = hospital,
                    Address = address, City = city)

class EditUserHandler(BaseHandler):
    async def put(self):
        data = tornado.escape.json_decode(self.request.body )
        username = data["username"]
        password = data["password"]
        name = data["name"]
        hospital_name = data["hospital_name"]
        hospital_address = data["hospital_address"]
        hospital_city = data["hospital_city"]
        old_username = self.get_cookie("username").replace("|", " ")
        document = await db.doctors.update_one({"username":old_username}, {"$set":{"username":username, "password":password, "hospital":hospital_name,
                                                                                    "hospitalAddress":hospital_address, "city":hospital_city, "name":name}})
        self.set_cookie("username", username.replace(" ", "|"))
        self.set_cookie("name", name.replace(" ", "|"))
        self.set_cookie("hospital", hospital_name.replace(" ", "|"))
        self.set_cookie("hospitalAddress", hospital_address.replace(" ", "|"))
        self.set_cookie("city", hospital_city.replace(" ", "|"))
        response = {"Username":username}
        self.write(json.dumps(response))

class DeleteUserHandler(BaseHandler):
    async def delete(self):
        username = self.get_cookie("username").replace("|", " ")
        document = await db.doctors.delete_one({"username":username})
        self.set_cookie("Checked", "Yes")
        response = {"Username":username}
        self.write(json.dumps(response))

class IndexHandler(BaseHandler):
    """Index Page"""

    @tornado.web.authenticated
    def get(self):
        self.render("admin_search.html")

class LoginHandler(BaseHandler):
    """Login Page"""

    def get(self):
        if not self.current_user:
            self.render("admin_login.html")
        else:
            self.redirect("/Index")
    # Have to use async since the database call is asynchronous.
    async def post(self):
        data = tornado.escape.json_decode(self.request.body)
        username = data["username"]
        password = data["password"]
        document = await db.admin.find_one({"username": username, "password": password})

        # Need to add cookies or another authentication method
        if document != None:
            self.set_secure_cookie("Admin", username)
            self.set_cookie("Checked", "No")
            response = {"LoggedIn": "True"}
            self.write(json.dumps(response))
        else:
            response = {"LoggedIn": "False"}
            self.write(json.dumps(response))

class LogoutHandler(tornado.web.RequestHandler):
    def get(self):
        self.clear_cookie("Admin")
        self.redirect("/")


settings = {
    "template_path": os.path.dirname(os.path.realpath(__file__)) + "/website/",
    "static_path": os.path.dirname(os.path.realpath(__file__)) + "/website/assets/",
    "debug": True,
    "cookie_secret": os.urandom(32),
    "login_url": "/"
}

ssl_ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
# .crt = Certificate and .key = private key
ssl_ctx.load_cert_chain("server.crt", "server.key")

app = tornado.web.Application([
    (r"/", LoginHandler),
    (r"/Logout", LogoutHandler),
    (r"/CreateUser", CreateUser),
    (r"/Index", IndexHandler),
    (r"/SearchByUser", SearchByUserHandler),
    (r"/Info", AccountInfoHandler),
    (r"/EditUser", EditUserHandler),
    (r"/DeleteUser", DeleteUserHandler),
    (r"/SearchByName", SearchByNameHandler),
], db=db, **settings)

if __name__ == "__main__":
    server = tornado.httpserver.HTTPServer(app, ssl_options=ssl_ctx)
    server.listen(8888)
    tornado.ioloop.IOLoop.current().start()