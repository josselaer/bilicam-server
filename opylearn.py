# opylearn is a python library that allows you to easily create a Tornado webserver hosting a machine learning application
# users are encouraged to overload functions as needed.

import tornado.web
import tornado.ioloop
from sklearn import linear_model
import pickle
import pymongo
import gridfs

class Opylearn:

    # Constructor showing available variables
    def __init__(self):
        self.data = 0
        self.targets = 0
        self.model = 0
        self.db = 0

    # loads data from mongodb into variable data
    def load_data(self):
        for fvector in self.db.data.find():
            self.data = np.vstack([self.targets, target])

    def load_targets(self):
        for target in self.db.targets.find():
            self.targets = np.vstack([self.targets, target])
            
    # insert data into instance and database
    def insert(self, data, target):
        self.db.data.insert_one(data)
        self.db.targets.insert_one(target)
    
    # loads pickled ML model
    def save_model(self):
        with open('model', 'wb') as handle:
            pickle.dump(self.model, handle, protocol=pickle.HIGHEST_PROTOCOL)
            
    def load_model(self):
        with open('model', 'rb') as handle:
            self.model = pickle.load(handle)
            
    # train model using data
    def train(self, X, y):
        self.model.fit(X, y)

    # cross validates the data using the current model
    def cross_validate(self, folds):
        cross_val_score(self.model, self.data, self.targets, cv=folds)

    # Start running instance of server
    def start_webserver(self):
        outer_self = self
        #async
        class PredictHandler(tornado.web.RequestHandler):
            def get(self):
                self.write("test")
                #return json
            def post(self):
                data = {}
                for k in self.request.arguments:
                    data[k] = self.get_argument(k)
                self.write(outer_self.model.predict(np.asarray(data.values())))
                outer_self.model.db.unlabeled_data.insert_one(data)
                

        class InsertHandler(tornado.web.RequestHandler):
            def get(self):
                self.write("test")
                #return json
            def post(self):
                data = {}
                for k in self.request.arguments:
                    data[k] = self.get_argument(k)
                self.write(data)
                outer_self.db.data.insert_one(data)


        def make_app():
            return tornado.web.Application([
                (r"/", PredictHandler),
                (r"/insert/", InsertHandler)
            ])
        app = make_app()
        app.listen(8887)
        tornado.IOloop.current().start()

    def add_path(handler, path):
        ##
        return

    def connect_to_database(host, port, path_to_database):
        client = MongoClient(host, port)
        self.db = client[path_to_database]
