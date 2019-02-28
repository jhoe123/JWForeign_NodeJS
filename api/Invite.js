var twilioSid = process.env["TWILIO_ACCOUNT_SID"];
var twilioAuthToken = process.env["TWILIO_AUTH_TOKEN"];
var twilioNumber = process.env["TWILIO_NUMBER"];
var googlePlayLink = 'https://play.google.com/store/apps/details?id=com.jrgames.foreignlanguage';
var googlePlayLinkTester = 'https://play.google.com/apps/testing/com.jrgames.foreignlanguage';
var twilio = require('twilio');
var client = new twilio(twilioSid, twilioAuthToken);
const database = require('../utils/database');
 
var INVITE_SENT = 0;
var INVITE_NOT_YET = -1;
var INVITE_ACCEPTED = 1;
var INVITE_ERROR_INVITER_NOT_FOUND = 100;
var INVITE_ERROR_SMS_API = 101;
var INVITE_ERROR_INVITE_ACCEPTED = 102;

module.exports = {
    // use to check invite status of mobile number
    "get": function (req, res, next) {
        
        var query = {
          sql: "select status from InviteData where mobile = \'" + req.query.mobile + "\'"
        };
        
        database.execute(query)
            .then(function(results)
            {
                console.log(results);
                if (results.length == 0)
                {
                    res.json( {status: INVITE_NOT_YET});
                }
                else
                {
                    res.json( {status: results[0].status });
                }
            })
            .catch(next);
    },
    
    // use to invite a mobile number
    "post": function (req, res, next) {
        
        var inviterUsername = req.query.inviterUsername;
        var mobile = req.query.mobile;
        var userType = req.query.userType;
        var isTester = req.query.isTester;
        var message = "";

        // STEP 1: make sure the invited user not yet accepted the invitation
        var query = {
            sql: "select status from InviteData where mobile = \'" + mobile + "\' and status = " + INVITE_ACCEPTED
        };
        
        database.execute(query)
            .then(function(results)
            {
                // was the invite was already consumed?
                if (results.length >= 1)
                {
                    res.json( {success: false, message: 'User with number ' + mobile + ' already accepted the invite.', errorcode: INVITE_ERROR_INVITE_ACCEPTED});
                    return;
                }
                
                // STEP 2: retrieve inviter info for message details
                query = {
                    sql: "select username, fname, lname from UserData where username = \'" + inviterUsername + "\'"
                };
                
                database.execute(query)
                    .then( function(results)
                    {
                        if (results.length == 1)
                        {
                            var inviterInfo = results[0];
                            message = inviterInfo.fname + " " + inviterInfo.lname + 
                                      " invited you to use JW Foreign Language App. Download now from Google Play Store ";
                            //if (isTester)
                            //    message += googlePlayLinkTester;
                            //else
                                message += googlePlayLink;
                    
                            // STEP 3: send message to invited user
                            client.messages.create(
                                {
                                    body: message,
                                    to: mobile,
                                    from: twilioNumber
                                }
                            ).then( message => {
                                
                                // STEP 4: add invite info to database. id, mobilenumber, userType, status
                                query = {
                                    sql:    "if not exists(select id from InviteData where mobile = \'"+mobile+"\') " +
                                                "insert into InviteData(inviter, mobile, userType, status) values(\'"+inviterInfo.username+"\', \'"+mobile+"\', \'"+userType+"\', \'"+INVITE_SENT+"\') " +
                                            "else " + 
                                                "update InviteData set userType = \'"+userType+"\', inviter = \'"+inviterInfo.username+"\' where mobile = \'"+mobile+"\' ",
                                    parameters: [
                                        { name: 'mobile', value: mobile},
                                        { name: 'inviter', value: inviterInfo.username },
                                        { name: 'userType', value: userType},
                                        { name: 'inviteStatus', value: INVITE_SENT}
                                    ]
                                };
                                
                                database.execute(query)
                                    .then( function(results) {
                                        
                                        // FINAL STEP: return result
                                        res.json( {success: true, data: message, message: 'User was successfully invited.'} );
                                        //console.log(message);
                                    })
                                    .catch(next);
                            })
                            .catch( error => 
                            {
                                console.log( error);
                                res.json( {success: false, message: 'Failed to send invite to ' + mobile, errorcode: INVITE_ERROR_SMS_API});    
                            });
                        }
                        else
                        {
                            res.json( {success: false, message: 'Cant find specified username', errorcode: INVITE_ERROR_INVITER_NOT_FOUND});
                        }
                    })
                    .catch(next);
            })
            .catch(next);
        
                
        
           
    }
};
