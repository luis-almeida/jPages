/* 
This is just a helper to "tabify" the example code.
You can find the original script here:
http://tools.arantius.com/tabifier 
*/


//gogo global variable
var level = 0;
var LOOP_SIZE = 100;


function finishTabifier(code) {
    code = code.replace(/\n\s*\n/g, '\n'); //blank lines
    code = code.replace(/^[\s\n]*/, ''); //leading space
    code = code.replace(/[\s\n]*$/, ''); //trailing space

    level = 0;
}

function cleanHTML(code) {
    var i = 0;

    function cleanAsync() {
        var iStart = i;
        for (; i < code.length && i < iStart + LOOP_SIZE; i++) {
            point = i;

            //if no more tags, copy and exit
            if (-1 == code.substr(i).indexOf('<')) {
                out += code.substr(i);
                finishTabifier(out);
                return;
            }

            //copy verbatim until a tag
            while ('<' != code.charAt(point)) point++;
            if (i != point) {
                cont = code.substr(i, point - i);
                if (!cont.match(/^\s+$/)) {
                    if ('\n' == out.charAt(out.length - 1)) {
                        out += tabs();
                    }
                    else if ('\n' == cont.charAt(0)) {
                        out += '\n' + tabs();
                        cont = cont.replace(/^\s+/, '');
                    }
                    cont = cont.replace(/\s+/g, ' ');
                    out += cont;
                }
                if (cont.match(/\n/)) {
                    out += '\n' + tabs();
                }
            }
            start = point;

            //find the end of the tag
            while ('>' != code.charAt(point)) point++;
            tag = code.substr(start, point - start);
            i = point;

            //if this is a special tag, deal with it!
            if ('!--' == tag.substr(1, 3)) {
                if (!tag.match(/--$/)) {
                    while ('-->' != code.substr(point, 3)) point++;
                    point += 2;
                    tag = code.substr(start, point - start);
                    i = point;
                }
                if ('\n' != out.charAt(out.length - 1)) out += '\n';
                out += tabs();
                out += tag + '>\n';
            }
            else if ('!' == tag[1]) {
                out = placeTag(tag + '>', out);
            }
            else if ('?' == tag[1]) {
                out += tag + '>\n';
            }
            else if (t = tag.match(/^<(script|style)/i)) {
                t[1] = t[1].toLowerCase();
                tag = cleanTag(tag);
                out = placeTag(tag, out);
                end = String(code.substr(i + 1)).toLowerCase().indexOf('</' + t[1]);
                if (end) {
                    cont = code.substr(i + 1, end);
                    i += end;
                    out += cont;
                }
            }
            else {
                tag = cleanTag(tag);
                out = placeTag(tag, out);
            }
        }

        if (i < code.length) {
            cleanAsync();
        }
        else {
            finishTabifier(out);
        }
    }

    var point = 0,
        start = null,
        end = null,
        tag = '',
        out = '',
        cont = '';
    cleanAsync();
    
    return out;
}

function tabs() {
    var s = '';
    for (var j = 0; j < level; j++) s += '\t';
    return s;
}

function cleanTag(tag) {
    var tagout = '';
    tag = tag.replace(/\n/g, ' '); //remove newlines
    tag = tag.replace(/[\s]{2,}/g, ' '); //collapse whitespace
    tag = tag.replace(/^\s+|\s+$/g, ' '); //collapse whitespace
    var suffix = '';
    if (tag.match(/\/$/)) {
        suffix = '/';
        tag = tag.replace(/\/+$/, '');
    }
    tag = tag.replace(/^\s+|\s+$/g, ' '); //collapse whitespace
    tag = tag.split(' ');
    for (var j = 0; j < tag.length; j++) {
        if (-1 == tag[j].indexOf('=')) {
            //if this part doesn't have an equal sign, just lowercase it and copy it
            tagout += tag[j].toLowerCase() + ' ';
        }
        else {
            //otherwise lowercase the left part and...
            var k = tag[j].indexOf('=');
            var tmp = [tag[j].substr(0, k), tag[j].substr(k + 1)];

            tagout += tmp[0].toLowerCase() + '=';
            var x = tmp[1].charAt(0);
            if ("'" == x || '"' == x) {
                //if the right part starts with a quote, find the rest of its parts
                tagout += tmp[1];
                while (x != String(tag[j]).charAt(String(tag[j]).length - 1)) {
                    tagout += ' ' + tag[++j];
                }
                tagout += ' ';
            }
            else {
                //otherwise put quotes around it
                tagout += "'" + tmp[1] + "' ";
            }
        }
    }
    return tagout.replace(/\s*$/, '') + suffix + '>';
}

/////////////// The below variables are only used in the placeTag() function
/////////////// but are declared global so that they are read only once
//opening and closing tag on it's own line but no new indentation level
var ownLine = ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'table', 'tbody', 'thead', 'tfoot'];

//opening tag, contents, and closing tag get their own line
//(i.e. line before opening, after closing)
var contOwnLine = ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'];

//line will go before these tags
var lineBefore = new RegExp('^<(/?' + ownLine.join('|/?') + '|' + contOwnLine.join('|') + ')[ >]');

//line will go after these tags
lineAfter = new RegExp('^<(br|/?' + ownLine.join('|/?') + '|/' + contOwnLine.join('|/') + ')[ >]');

//inside these tags (close tag expected) a new indentation level is created
var newLevel = ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul'];
newLevel = new RegExp('^</?(' + newLevel.join('|') + ')[ >]');

function placeTag(tag, out) {
    var nl = tag.match(newLevel);
    if (tag.match(lineBefore) || nl) {
        out = out.replace(/\s*$/, '');
        out += "\n";
    }

    if (nl && '/' == tag.charAt(1)) level--;
    if ('\n' == out.charAt(out.length - 1)) out += tabs();
    if (nl && '/' != tag.charAt(1)) level++;

    out += tag;
    if (tag.match(lineAfter) || tag.match(newLevel)) {
        out = out.replace(/ *$/, '');
        out += "\n";
    }
    return out;
}

function cleanCSS(code) {
    var i = 0,
        instring = false,
        c;

    function cleanAsync() {
        var iStart = i;
        for (; i < code.length && i < iStart + LOOP_SIZE; i++) {
            c = code.charAt(i);

            if (instring) {
                if (instring == c) {
                    instring = false;
                }
                out += c;
            }
            else if ('{' == c) {
                level++;
                out += ' {\n' + tabs();
            }
            else if ('}' == c) {
                out = out.replace(/\s*$/, '');
                level--;
                out += '\n' + tabs() + '}\n' + tabs();
            }
            else if ('"' == c || "'" == c) {
                if (instring && c == instring) {
                    instring = false;
                }
                else {
                    instring = c;
                }
                out += c;
            }
            else if (';' == c) {
                out += ';\n' + tabs();
            }
            else if ('\n' == c) {
                out += '\n' + tabs();
            }
            else {
                out += c;
            }
        }

        if (i < code.length) {
            cleanAsync();
        }
        else {
            level = li;
            out = out.replace(/[\s\n]*$/, '');
            finishTabifier(out);
        }
    }

    if ('\n' == code[0]) code = code.substr(1);
    code = code.replace(/([^\/])?\n*/g, '$1');
    code = code.replace(/\n\s+/g, '\n');
    code = code.replace(/[	 ]+/g, ' ');
    code = code.replace(/\s?([;:{},+>])\s?/g, '$1');
    code = code.replace(/\{(.*):(.*)\}/g, '{$1: $2}');

    var out = tabs(),
        li = level;
    cleanAsync();
    
    return out;
}

function cleanCStyle(code) {
    var i = 0;

    function cleanAsync() {
        var iStart = i;
        for (; i < code.length && i < iStart + LOOP_SIZE; i++) {
            c = code.charAt(i);

            if (incomment) {
                if ('//' == incomment && '\n' == c) {
                    incomment = false;
                }
                else if ('/*' == incomment && '*/' == code.substr(i, 2)) {
                    incomment = false;
                    c = '*/\n';
                    i++;
                }
                if (!incomment) {
                    while (code.charAt(++i).match(/\s/));;
                    i--;
                    c += tabs();
                }
                out += c;
            }
            else if (instring) {
                if (instring == c && // this string closes at the next matching quote
                // unless it was escaped, or the escape is escaped
                ('\\' != code.charAt(i - 1) || '\\' == code.charAt(i - 2))) {
                    instring = false;
                }
                out += c;
            }
            else if (infor && '(' == c) {
                infor++;
                out += c;
            }
            else if (infor && ')' == c) {
                infor--;
                out += c;
            }
            else if ('else' == code.substr(i, 4)) {
                out = out.replace(/\s*$/, '') + ' e';
            }
            else if (code.substr(i).match(/^for\s*\(/)) {
                infor = 1;
                out += 'for (';
                while ('(' != code.charAt(++i));;
            }
            else if ('//' == code.substr(i, 2)) {
                incomment = '//';
                out += '//';
                i++;
            }
            else if ('/*' == code.substr(i, 2)) {
                incomment = '/*';
                out += '\n' + tabs() + '/*';
                i++;
            }
            else if ('"' == c || "'" == c) {
                if (instring && c == instring) {
                    instring = false;
                }
                else {
                    instring = c;
                }
                out += c;
            }
            else if ('{' == c) {
                level++;
                out = out.replace(/\s*$/, '') + ' {\n' + tabs();
                while (code.charAt(++i).match(/\s/));;
                i--;
            }
            else if ('}' == c) {
                out = out.replace(/\s*$/, '');
                level--;
                out += '\n' + tabs() + '}\n' + tabs();
                while (code.charAt(++i).match(/\s/));;
                i--;
            }
            else if (';' == c && !infor) {
                out += ';\n' + tabs();
                while (code.charAt(++i).match(/\s/));;
                i--;
            }
            else if ('\n' == c) {
                out += '\n' + tabs();
            }
            else {
                out += c;
            }
        }

        if (i < code.length) {
            cleanAsync();
        }
        else {
            level = li;
            out = out.replace(/[\s\n]*$/, '');
            finishTabifier(out);
        }
    }

    code = code.replace(/^[\s\n]*/, ''); //leading space
    code = code.replace(/[\s\n]*$/, ''); //trailing space
    code = code.replace(/[\n\r]+/g, '\n'); //collapse newlines
    var out = tabs(),
        li = level,
        c = '';
    var infor = false,
        forcount = 0,
        instring = false,
        incomment = false;
    cleanAsync();
    
    return out;
}

function cleanJson(code) {
    var i = 0;

    function cleanAsync() {
        var iStart = i;
        for (; i < code.length && i < iStart + LOOP_SIZE; i++) {
            c = code.charAt(i);

            if (instring) {
                if (instring == c && // this string closes at the next matching quote
                // unless it was escaped, or the escape is escaped
                ('\\' != code.charAt(i - 1) || '\\' == code.charAt(i - 2))) {
                    instring = false;
                }
                out += c;
            }
            else if ('"' == c || "'" == c) {
                if (instring && c == instring) {
                    instring = false;
                }
                else {
                    instring = c;
                }
                out += c;
            }
            else if ('{' == c || '[' == c) {
                level++;
                out += c + '\n' + tabs();
                while (code.charAt(++i).match(/\s/));;
                i--;
            }
            else if ('}' == c || ']' == c) {
                out = out.replace(/\s*$/, '');
                level--;
                if (!out.match(/({|\[)$/)) out += '\n' + tabs();
                out += c;
                while (code.charAt(++i).match(/\s/));;
                i--;
            }
            else if (',' == c) {
                out += ',\n' + tabs();
                while (code.charAt(++i).match(/\s/));;
                i--;
            }
            else {
                out += c;
            }
        }

        if (i < code.length) {
            cleanAsync();
        }
        else {
            level = li;
            out = out.replace(/[\s\n]*$/, '');
            finishTabifier(out);
        }
    }

    code = code.replace(/^[\s\n]*/, ''); //leading space
    code = code.replace(/[\s\n]*$/, ''); //trailing space
    code = code.replace(/[\n\r]+/g, '\n'); //collapse newlines
    var out = tabs(),
        li = level,
        c = '';
    var infor = false,
        forcount = 0,
        instring = false,
        incomment = false;
    cleanAsync();
    
    return out;
}
