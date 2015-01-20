import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web

import json
from fileinput import filename


clientMap = dict()
nameMap = dict()
toolLog = []
MAX_TOOL_LOG_SIZE = -1
adminPwd = "12345"
import os.path
logDir = os.path.join('..','files','logs')

def generateID():
    generateID.id += 1
    return generateID.id
generateID.id = 0

class State:
    INITIALIZED = "init"
    WAIT_FOR_NAME = "waitForName"
class Role:
    NORMAL = "normal"
    ADMIN = "admin"
class User:
    
    state = State.WAIT_FOR_NAME
    roles = {Role.NORMAL}
    def __init__(self, client):
        self.name = ""
        self.client = client
    
    def __json__(self, request):
        print "Json with name: ", self.name
        return dict(name=self.name)
    
    
        
class WSHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        
        userID = generateID()
        user = User(self)
        
    
        
        clientMap[self] = user
#         self.broadcastMessageBesidesSelf(json.dumps(dict(type="User", action="Join", name=user.name)))
#      
#         self.write_message(json.dumps(dict(type="User", action="Nickname", name=userID)))
#         joinevent = dict(type="User", action="Join", name=userID)
#         self.broadcastMessageBesidesSelf(json.dumps(joinevent))
      
      
    def on_message(self, message):
        obj = json.loads(message)
        global toolLog
        msgType = obj["type"]
        action = obj["action"]
        if msgType == "User" :
            if action == "DesireNickname":
                name = obj["name"]
                usr = clientMap[self]
                if usr.state == State.WAIT_FOR_NAME:
                    if name not in nameMap:
                        msg = dict(type="User", action="AcceptedNickname", name=name)
                        self.write_message(json.dumps(msg))
                        for u in nameMap:
                            self.write_message(json.dumps(dict(type="User", action="Join", name=u)))
                        nameMap[name] = self
                        usr.name = name
                        usr.state = State.INITIALIZED
                        
                        joinevent = dict(type="User", action="Join", name=name)
                        self.broadcastMessage(json.dumps(joinevent))
                        
                        self.write_message(json.dumps(dict(type="Server", action="clear"))) 
                        self.sendPlayback()
                        print("Activated nickname:", name)
                    else:
                        msg = dict(type="User", action="NicknameAlreadyInUse", name=name)
                        self.write_message(json.dumps(msg))
        elif msgType == "Tool":
            self.broadcastMessageBesidesSelf(message)
            toolLog.append(obj)
            if MAX_TOOL_LOG_SIZE >= 0 and len(toolLog) > MAX_TOOL_LOG_SIZE:
                toolLog.pop(0)
        elif msgType == "Chat":
            if action == "Msg":
                data = obj['data']
                
                if data[0] == '/':
                    self.handleServerMessage(obj)
                else:
                    self.broadcastMessage(message)
#         print ('message received %s' % message)
        

    def handleServerMessage(self,messageObj):
        data = messageObj['data']
        data = data[1:]     
        global toolLog
        if len(data) == 0:
            return   
        elif data.find("playlog") == 0:
                    
            self.sendPlayback()
        elif data.find("clearlog") == 0:
            usr = clientMap[self]
            if Role.ADMIN in usr.roles:
                toolLog = []
                print "Clearing log: "
            else:
                self.write_message(json.dumps(dict(type="Server",action="AccessDenied", msg="You do not have the necessary rights")))
        elif data.find("admin") == 0:
            splits = data.split()
            if len(splits) < 2:
                self.write_message(json.dumps(dict(type="Server",action="PasswordWrong", msg="Wrong password")))
                return
            if splits[1] == adminPwd:
                usr = clientMap[self]
                usr.roles = usr.roles | {Role.ADMIN}
                self.write_message(json.dumps(dict(type="Server",action="AdminStatusGained")))
        elif data.find("savelog") == 0:
            usr = clientMap[self]
            if Role.ADMIN in usr.roles:
                splits = data.split()
                if(len(splits) <2):
                    return
                filename = splits[1]
                self.saveLog(filename)
            else:
                self.write_message(json.dumps(dict(type="Server",action="AccessDenied", msg="You do not have the necessary rights")))
        elif data.find("loadlog") == 0:
            usr = clientMap[self]
           
            if Role.ADMIN in usr.roles:
                splits = data.split()
                if(len(splits) <2):
                    return
                filename = splits[1]
                self.loadLog(filename)
                self.broadcastMessage(json.dumps(dict(type="Server",action="clear"))) 
                for client in clientMap:
                    client.sendPlayback()
            else:
                self.write_message(json.dumps(dict(type="Server",action="AccessDenied", msg="You do not have the necessary rights")))
        elif data.find("clear") == 0:
            usr = clientMap[self]
           
            if Role.ADMIN in usr.roles:
                toolLog = []
                self.broadcastMessage(json.dumps(dict(type="Server",action="clear"))) 
        elif data.find("listlogs") == 0:
            usr = clientMap[self]
           
            if Role.ADMIN in usr.roles:
                dirlist = os.listdir(logDir)
                self.write_message(json.dumps(dict(type="Server",msg="Listing log names:")))  
                for name in dirlist:
                    np = os.path.join(logDir,name)
                    if not os.path.isfile(np):
                        continue
                    self.write_message(json.dumps(dict(type="Server",msg=name)))     
                
            else:
                self.write_message(json.dumps(dict(type="Server",action="AccessDenied", msg="You do not have the necessary rights")))
               
    def sendPlayback(self):
        self.write_message(json.dumps(dict(type="Server", msg="Start sending log")))  
        import utilP2
        scrambledToolLog = json.dumps(toolLog)
        lzwLog = compress(scrambledToolLog)
        
        result= [];
        for v in lzwLog:
            if isinstance(v, str):
#               Every field should only be one long  
                result.append(ord(v[0]))
            else :
                result.append(v)
        
        
        playback = dict(type="Tool", action="Playback", lzwData=result)
        self.write_message(json.dumps(playback))
        self.write_message(json.dumps(dict(type="Server", msg="Finished sending log")))
        
    def on_close(self):
        usr = clientMap[self]
        nameMap.pop(usr.name)
        clientMap.pop(self)
        
        leaveEvent = dict(type="User", action="Leave", name=usr.name)
        self.broadcastMessageBesidesSelf(json.dumps(leaveEvent))
                  
        print 'Removed user: ', usr.name
      
    
    def check_origin(self, origin):
        return True
    
    def broadcastMessageBesidesSelf(self, message):
#         print("Broadcast message: ",message)
        for client in clientMap:
            user = clientMap[client]
            if client == self or user.state != State.INITIALIZED:
                continue
            user.client.write_message(message)        
    
    def broadcastMessage(self, message):
        for client in clientMap:
            user = clientMap[client]
            if user.state != State.INITIALIZED:
                continue
            user.client.write_message(message)   
            
    
    def saveLog(self,filename):
        import pickle

        p = os.path.join(logDir,filename)
        with open(p, 'wb') as f:
            pickle.dump(toolLog,f)
        print "Saved log ",filename
            
    def loadLog(self,filename):
        import pickle
        global toolLog
        p = os.path.join(logDir,filename)
        with open(p, 'rbU') as f:
            toolLog = pickle.load(f)
        print "Loaded log ",filename

settings = {
    'debug': True,
    'autoreload': True,
    "static_path": os.path.join('..','files'),
}   
application = tornado.web.Application([
    (r'/ws', WSHandler),
  (r"/(.*)", tornado.web.StaticFileHandler, {"path":os.path.join('..','files','data'),"default_filename":"index.html"}),
])


if __name__ == "__main__":
    print "Starting server"
    import Configparser
    conf = os.path.join("..","config.ini")

    port = 8888
    if os.path.lexists(conf):
        confp = Configparser.ConfigParser()
        confp.read(conf)
        if confp.has_option("general", "adminPassword"):
            adminPwd = confp.get("general", "adminPassword")
        if confp.has_option("general","port"):
            port = int(confp.get("general", "port"))
        if confp.has_option("general", "logDir"):
            logDir = os.path.join(confp.get("general", "logDir"))
        if confp.has_option("general", "maxLogSize"):
            MAX_TOOL_LOG_SIZE = int(confp.get("general", "maxLogSize"))

    if not os.path.exists(logDir):
        os.makedirs(logDir)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(port)
    
    print "Started"
    tornado.ioloop.IOLoop.instance().start()
