# Draw in groups inside your browser
A HTML5 based multiplayer browser drawing Tool with a python backend server

As of now, it provides a basic pen with variable color and opacity and a color picker.
Wacom tablets may use pressure sensitivity by activating the plugin installed with the Wacom driver

Drawings may be saved in two ways. First as a simple image. Second as a video, which will play back all steps taken to produce the current image. If possible, videos will use the WEBM format. A fallback exists for other browsers, which will produce an AVI file.

One user may start a server on which other people may join! Their pen strokes will be distributed to allow drawing with multiple people at the same time. A chat function is also included.
When entering a session, users will see a replay of the session up to that point. The admin may save and restore sessions.

Included is a .bat file for windows users, which starts the server. Linux and Mac users (currently) will have to do it manually, by changing into the src directory and running "python serverMain.py" in the shell. (Python 2 users may use "python serverMainP2.py", though apparently this is not working yet).

By default, the site can then be found by entering localhost:8888 (default) into the browser. Other people may join by replacing localhost with your IP (can be found with for example, http://www.whatsmyip.org/). Maybe, you will have to activate port forwarding on your router for that to work.

This is still in development, but the basic functions work already. 
I recommend using Chrome


----------------------------------------------------------------------------
# Usage
----------------------------------------------------------------------------
You can start the tool either as described above or just open the index.html in the files/data directory in your browser

When starting the tool, you can move around the different dialogs. You can activate the pen tool with either the SimplePen button or by pressing 'p'. The color picker can be chosen with the appropriate button or pressing 'c'-

When connecting to a server, you may usually leave all fields as they are. They will be filled with the domain you accessed the file. When in chat, you can either just write messages or log in as admin.
The default password is '12345', which may be changed in the config file.

----------------------------------------------------------------------------
# Admin commands
----------------------------------------------------------------------------
To log in, type 
  /admin password
with password replaced by the actual password ('12345' default)
When admin, you can save and restore sessions
To save a session, type
  /savelog logname
To restore a session, type
  /loadlog logname
To list available sessions, type
  /listlogs
  

