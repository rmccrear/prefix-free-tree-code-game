var assert = require('chai').assert;
const t = require('@testing-library/dom');
const jsdom = require("jsdom");

const mockRequire = require('mock-require');
mockRequire('../app/sounds.js', {createAudioTags: () =>  {
        return {
            'drip': {play: ()=>{}},
            'drain': {play: ()=>{}},
            'typewriter': {play: ()=>{}}
        };
    }
});


const body = `
<div class="game-container">
<div class="message-container">
  Enter your message here:
  <input type="text" id="message" />
  <div class="share-elm">
    <a class="share-a" target='shareable_tab_for_bin_tree'>share</a>
  </div>
  <div class="encoding">
    Encoding (<span class="bits-display">0</span>bits): <div id="code"></div>
  </div>
</div>
<div id="board"></div>
</div>
`;

const cleanup = require("global-jsdom")(body, {url: 'http://localhost'});


describe('Writer 3', function(){
    let writeOnReady;
    before(function() {
        this.cleanup = require("global-jsdom")(body, {url: 'http://localhost'});
        writeOnReady = require('../app/write-message.js').writeOnReady;
        //const virtualConsole = new jsdom.VirtualConsole();
        //virtualConsole.sendTo(console);
        // window.document.body.innerHTML = body;

        //writeOnReady();

        //console.log('div count: ', document.querySelectorAll('div').length);
    });
    after(function(){
        this.cleanup();
    })

    beforeEach(function(){
        console.log('location: ', window.location.href);
        window.document.body.innerHTML = body;

        writeOnReady();
    });
/**/

    afterEach(function(){
        //this.cleanup();
        window.history.replaceState(null, null, `writer.html`);
        document.getElementsByTagName('html')[0].innerHTML = '';

    });
/**/
    it('should render 2', function(){
        assert.equal(document.querySelectorAll('.pipe-tile.pipe-A').length, 2);
        const d = document.querySelectorAll('.pipe-tile.pipe-A');
        console.log(d.length);
        assert.equal(d.length, 2);

        const input = window.document.querySelector('input');
        input.value = 'Hello World!'
        var inputEvent = new window.Event('input', {
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(inputEvent);
        const dd = document.querySelectorAll('.pipe-tile.pipe-A');
        assert.equal(dd.length, 9);

    });
/**/
    it('should add tile when the message changes 3', function(){
        assert.equal(document.querySelectorAll('.pipe-tile.pipe-A').length, 2);
        const d = document.querySelectorAll('.pipe-tile.pipe-A');
        console.log(d.length);
        assert.equal(d.length, 2);

        const input = window.document.querySelector('input');
        input.value = 'Hello World!'
        var inputEvent = new window.Event('input', {
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(inputEvent);
        const dd = document.querySelectorAll('.pipe-tile.pipe-A');
        assert.equal(dd.length, 9);
    });
/**/
});

