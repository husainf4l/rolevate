(venv) husain@websites:~/rolevate/livekit$ sudo cp /home/husain/rolevate/livekit/livekit-agent.service /etc/systemd/system/
[sudo] password for husain: 
(venv) husain@websites:~/rolevate/livekit$ chmod +x /home/husain/rolevate/livekit/start_agent.sh
(venv) husain@websites:~/rolevate/livekit$ crontab -l
no crontab for husain
(venv) husain@websites:~/rolevate/livekit$ echo "@reboot /home/husain/rolevate/livekit/start_agent.sh > /home/husain/rolevate/livekit/agent.log 2>&1" | crontab -
(venv) husain@websites:~/rolevate/livekit$ crontab -l
@reboot /home/husain/rolevate/livekit/start_agent.sh > /home/husain/rolevate/livekit/agent.log 2>&1
(venv) husain@websites:~/rolevate/livekit$ chmod +x /home/husain/rolevate/livekit/monitor_agent.sh
(venv) husain@websites:~/rolevate/livekit$ (crontab -l; echo "* * * * * /home/husain/rolevate/livekit/monitor_agent.sh") | crontab -
(venv) husain@websites:~/rolevate/livekit$ crontab -l
@reboot /home/husain/rolevate/livekit/start_agent.sh > /home/husain/rolevate/livekit/agent.log 2>&1
* * * * * /home/husain/rolevate/livekit/monitor_agent.sh
(venv) husain@websites:~/rolevate/livekit$ cd /home/husain/rolevate/livekit && ./monitor_agent.sh
(venv) husain@websites:~/rolevate/livekit$ cd /home/husain/rolevate/livekit && ./monitor_agent.sh
(venv) husain@websites:~/rolevate/livekit$ cd /home/husain/rolevate/livekit && ./monitor_agent.sh
(venv) husain@websites:~/rolevate/livekit$ cat /home/husain/rolevate/livekit/monitor.log
2025-06-13 19:14:51 - Agent is not running. Starting...
2025-06-13 19:14:51 - Agent started with PID: 78863
2025-06-13 19:14:54 - Agent is running (PID: 78863)
(venv) husain@websites:~/rolevate/livekit$ chmod +x /home/husain/rolevate/livekit/agent_control.sh
(venv) husain@websites:~/rolevate/livekit$ cd /home/husain/rolevate/livekit && ./agent_control.sh status
Agent is running (PID: 78863)
Port status:
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
python  78863 husain   12u  IPv6 609513      0t0  TCP *:8005 (LISTEN)
python  78863 husain   13u  IPv4 609514      0t0  TCP *:8005 (LISTEN)
(venv) husain@websites:~/rolevate/livekit$ ps aux | grep "python agent.py"
husain     78863  5.7  7.1 1989040 281340 pts/23 Sl   19:14   0:02 python agent.py start
husain     79105  0.0  0.0   6680  2304 pts/23   S+   19:15   0:00 grep --color=auto python agent.py
(venv) husain@websites:~/rolevate/livekit$ cd /home/husain/rolevate/livekit && bash -x ./agent_control.sh status
+ AGENT_DIR=/home/husain/rolevate/livekit
+ PIDFILE=/home/husain/rolevate/livekit/agent.pid
+ case "$1" in
+ '[' -f /home/husain/rolevate/livekit/agent.pid ']'
++ cat /home/husain/rolevate/livekit/agent.pid
+ PID=78863
+ ps -p 78863
+ echo 'Agent is running (PID: 78863)'
Agent is running (PID: 78863)
+ echo 'Port status:'
Port status:
+ lsof -i :8005
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
python  78863 husain   12u  IPv6 609513      0t0  TCP *:8005 (LISTEN)
python  78863 husain   13u  IPv4 609514      0t0  TCP *:8005 (LISTEN)