SMS Platform Gateway Details - (MARGO Medical Equipment - margogroup )
Platform Login Details
Link:                 https://josms.net/sms/smsonline
Username:        margogroup
Password:         wKridi7iT
Gateway Links:
Accname:                margogroup
AccPassword:         nR@9g@Z7yV0@sS9bX1y
Account Senders
MargoGroup
Get Balance Gateway
Description:
Used to get the remaining balance in your SMS platform.
Gateway Link:
https://www.josms.net/sms/api/GetBalance.cfm?AccName=Your_AccName&AccPass=Your_AccPass
Gateway Link (Rest API):
https://www.josms.net/SMS/API/GetBalance?AccName=Your_AccName&AccPass=Your_AccPass
Sending One by One Messages OTP Only
Description:
This gateway used to send OTP messages to only one mobile number.
Gateway Link:
https://www.josms.net/SMSServices/Clients/Prof/SingleSMS/SMSService.asmx/SendSMS?senderid=Your_Sender_ID&numbers=9627********&accname=Your_AccName&AccPass=Your_AccPass&msg=SMSBODY&id=
Gateway Link (Rest API):
https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS/SendSMS?senderid=Your_Sender_ID&numbers=9627********&accname=Your_AccName&AccPass=Your_AccPass&msg=SMSBODY
Sending One by One Messages General
Description:
This gateway used to send General messages such as (Announcement ,Payment ) to only one mobile number.
Gateway Link:
https://www.josms.net/SMSServices/Clients/Prof/SingleSMS_General/SMSService.asmx/SendSMS?senderid=Your_Sender_ID&numbers=9627********&accname=Your_AccName&AccPass=Your_AccPass&msg=SMSBODY&id=
Gateway Link (Rest API):
https://www.josms.net/SMSServices/Clients/Prof/RestSingleSMS_General/SendSMS?senderid=Your_Sender_ID&numbers=9627********&accname=Your_AccName&AccPass=Your_AccPass&msg=SMSBODY
Sending Bulk Messages Gateway
Description:
This gateway used to send messages to more than one numbers at the same time up to 120 mobile numbers.
Gateway Link:
https://www.josms.net/sms/api/SendBulkMessages.cfm?numbers=9627********,9627********,&senderid=Your_Sender_ID&AccName=Your_AccName&AccPass=Your_AccPass&msg=SMSBody&requesttimeout=5000000
Parameters Description:
Below is a description of each parameter used in the gateway links
❈AccName:
? A fixed value represents your gateway account username, this value must not be changed.
❈ AccPass:
? A fixed value represents your gateway account password, this value must not be changed.
❈ Senderid:
? Use the sender that exits under your account.
? To request a new sender, please contact your account manager.
❈ Numbers:
Start your number with 962 then followed by operator code (77 ,78 or 79).
Don?t use any special character like + or dot.
Don?t write 00 before 962.
Mobile number must be of length 12.
Ex. 962775444418
Add a comma after each number you want to send the message to.
Ex: Numbers=962775444418,962775444413,
❈ Msg:
The text message you want to send
Message length calculated as below:

For Arabic messages:
One message only 70 Character.
More than one message 62 character for each one.
For English messages:
One message only 160 characters.
More than one message 152 character for each one.
Please replace ?%? with %25, and ?&? with %26
❈ Requesttimeout:
? Used to increase the time to handle your gateway request before being timed out.
Parameters Values:
Parameters:
senderid: MargoGroup
numbers:Mobile Number (ex. 9627XXXXXXXX )
accname: margogroup
accpass: nR@9g@Z7yV0@sS9bX1y
msg:Content of the message
id: message id from client side used to track the message (optional)

