# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

Stage 1 of this project will demonstrate responsive design patterns, including, but not limited to, responsive images 
and CSS grid layout. Accessibility for screen readers will follow the WAI-ARIA specification. Finally, the website will 
be designed  to be offline first to provide a seamless offline experience for users.

## Project Overview: Stage 2
Stage 2 of this project will incrementally convert the static webpages to a mobile-ready web application. The application
will be connected to an external server and then converted to use asynchronous JavaScript to request JSON data from the
server. The received data will be stored in an offline database using IndexedDB. Finally, the app will be optimized to
meet the required performance benchmarks.

### How to Run the Project

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

2. Check to see if you have Python installed. In a terminal, check the version of Python you have: `python -V`. 

   If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) 
   For Python 3.x, you can use `python3 -m http.server 8000` or `python -m http.server`. 
   
   If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

3. The local API server requires Node.js LTS Version v6.11.2.

   If you don't have Node.js installed, navigate to [website](https://nodejs.org/en/download/) to download and install the software.
   
4. Once you have node installed, fork and clone the [server repository](https://github.com/udacity/mws-restaurant-stage-2).
   Then navigate to the project folder.
   
5. Install the API server project dependencies by running the command `npm i`.

6. Install Sails.js globally by running the command `npm i sails -g`.

7. Start the server with `node server`.

8. With both the app and API servers running, visit the site: `http://localhost:8000`.