# Prefix Free Pipes

A "game" to help you learn about Hoffman encodings.

Make a message, and the letters will appear in the tree.

You can send a link to your friends, who will have to decode the message themselves.

Hint: You can change the total length of your encoded message by dragging the letters from one node to another. Try to make your encoded message as short as possible given the letters you used. Or, you can make it as long as you want!

## Contributing

To run this program locally, clone the repository.

    git clone

There are no more dependencies to install for the web app to run. (bacon.js, underscore.js, and jQuery are saved under /vendor) A build process is not needed as all imports are done with browser supported es6 style imports.

You can start the dev server with:

    npm install # to install http-server
    npm start

or by starting your own server in the root directory of the project (for example `python3 -m http.server`).

You can also fork this repository on Replit at https://replit.com/@rmccrear/prefix-free-tree-code-game
