(function () {
/*
  ^\s*         #tolerate pre-whitespace
  s            #substitution prefix
  (\/|\|)      #delimiter declaration
  (            #begin matching regex
    (?:        #match shit which isn't an...
      (?:\\\1) #escaped delimeter
      |        #or...
      [^\1]    #anything but the delimeter
    )*?
  )            #end matching regex
  \1           #delimeter again
  (            #the fa-chizzle all over again...this time for replacement
    (?:
      (?:\\\1)
      |
      [^\1]
    )*?
  )      #read above, I'm not repeating this crap
  \1
  (      #flag capturing group
    g?   #global (optional)
    i?   #case insensitive (optional)
  )      #FIN
 */
var sub = /^\s*s(\/|\|)((?:(?:\\\1)|[^\1])*?)\1((?:(?:\\\1)|[^\1])*?)\1(g?i?)/;
bot.listen( sub, substitute );

function substitute ( msg ) {
	var re = RegExp( msg.matches[2], msg.matches[4] ),
		replacement = msg.matches[ 3 ];

	if ( !msg.matches[2] ) {
		return 'Empty regex is empty';
	}

	var message = get_matching_message( re, msg.get('message_id') );
	bot.log( message, 'substitution found message' );

	if ( !message ) {
		return 'No matching message (are you sure we\'re in the right room?)';
	}

	var link = get_message_link( message );
	return message.textContent.replace( re, replacement ) + ' ' +
		msg.link( '(source)', link );
}

function get_matching_message ( re, onlyBefore ) {
	var messages = [].slice.call(
		document.getElementsByClassName('content') ).reverse();
	return messages.first( matches );

	function matches ( el ) {
		var id = Number( el.parentElement.id.match(/\d+/)[0] );
		return id < onlyBefore && re.test( el.textContent );
	}
}

// <a class="action-link" href="/transcript/message/msgid#msgid>...</a>
// <div class="content">message</div>
//if the message was a reply, there'd be another element between them:
// <a class="reply-info" href="/transcript/message/repliedMsgId#repliedMsgId>
function get_message_link ( message ) {
	var node = message;

	while ( !node.classList.contains('action-link') ) {
		node = node.previousElementSibling;
	}

	return node.href;
}
}());
