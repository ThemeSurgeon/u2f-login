(function($) {
	$loginform = $('#loginform');

	$loginform.submit(function( e ) {
		e.preventDefault();
		$('#wp-submit').val( u2f_l10n.Wait );

		var username = $('#user_login').val();
		var password = $('#user_pass').val();
		var u2f_avail = ( typeof u2f !== 'undefined') && ( u2f_data.u2f_avail != 'false');

		$.post(
			u2f_data.ajax_url,
			{
				action: 'u2f_login',
				data: {
					'log': username,
					'pwd': password,
					'u2f': u2f_avail,
				}
			}
		)
			.done(function( data, textStatus, jqXHR ){
				console.log('Ajax Response', jqXHR );

				$('#wp-submit').val( u2f_l10n.Login );

				if( data.success ) {
					console.log('Authenticated successfully');
					$('#method').val( data.method );

					if( u2f_avail && data.method == 'u2f') {
						$loginform.children().hide()
							.parent().append('<div class="u2f-guide">' + u2f_l10n.U2FGuide + '</div>')
							.children(".u2f-guide")
							.append('<div class="circle">')
							.children(".circle")
							.append('<div class="semicircle">')
							.append('<div class="semicircle">')
							.append('<div class="semicircle">')
							.append('<div class="semicircle">');
						$loginform.parent().children('#nav').html('<a href="wp-login.php?u2f_avail=false" title="">' + u2f_l10n.LostKeyGuide + '</a>');

						setTimeout(function() {
							console.log('sign', data.data );
							u2f.sign( data.data, function( data ) {
								console.log('Authenticate callback', data );
								$('#u2f_response').val( JSON.stringify( data ) );
								$loginform.off('submit').submit();
							});
						}, 1000);
					} else if( data.method == 'mailtoken') {
						$loginform.off('submit').children(':not(.submit)').hide()
							.parent().prepend('<p>'
								+ '<label>' + u2f_l10n.EmailTokenGuide + '<br/>'
								+ '<input type="text" name="token" id="token" class="input" size="7"/></label>'
								+ '</p>');
					}
				} else {
					console.log('Error occured');

					if( data.message ) {
						data.message.forEach( function( message ) {
							$loginform.before('<p class="message">' + message + '</p>');
						});
					}
					if( data.error ) {
						data.error.forEach( function( error ) {
							$loginform.before('<div id="login_error">' + error + '</div>');
						});
					}
				}
			})
			.fail(function( jqXHR, textStatus, errorThrown ){
				console.log('Ajax Response(Bad HTTP Status)', jqXHR );

			})
			.always(function( data_jqXHR, textStatus, jqXHR_errorThrown ){
			});
	});
})(jQuery);
