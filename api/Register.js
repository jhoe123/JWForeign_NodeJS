const database = require('../utils/database');

module.exports = {
    
    // use to check if username already exist
    "get": function (req, res, next) {
        var username = req.query.username;
        
        var query = {
          sql: 'select id from UserData where username = \'' + username + '\''
        };
        
        database.execute(query)
            .then(function(results)
            {
                // is the username found?
                if (results.length >= 1)
                {
                    res.json( {"success": false});
                }
                else
                {
                    res.json( {"success": true});
                }

                //console.log(results);
            })
            .catch(next);
            
    },
    
    "post": function (req, res, next)
    {
        var mobile = req.query.mobile;
        var fname = req.query.fname;
        var lname = req.query.lname;
        var username = req.query.username;
        var pass = req.query.pass;
        var cong = req.query.cong;
        var contactId = req.query.cId;
        
        // add user only if username is not yet existed
        var query = {
            sql: 
            'if not exists(select * from UserData where username = @username) ' + 
            'insert UserData(fname, lname, username, pass, cong, userType, inviteId) '+ 
                    'values(@fname, @lname, @username, @pass, @cong, (select userType from InviteData where mobile = @mobile), (select id from InviteData where mobile = @mobile)) ' +
            'insert ContactData(id, createdBy, firstname, lastname, username, congregation) values(@cId, @username, @fname, @lname, @username, @cong) ' +
            // set the invite status for this user as accepted
            "update InviteData set status = 1 where mobile = @mobile",
            parameters: [
                { name: 'fname', value: fname},
                { name: 'lname', value: lname},
                { name: 'username', value: username},
                { name: 'pass', value: pass},
                { name: 'cong', value: cong},
                { name: 'cId', value: contactId },
                { name: 'mobile', value: mobile }
            ]
        };
        
        database.execute(query).
            then( function(results)
            {
                res.json(results);
                console.log(results);
            }).
            catch(next);
    } 
};
