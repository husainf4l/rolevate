#!/bin/bash

# Script to get your local IP address for mobile app development
# This IP should be used in your Flutter app's GraphQL configuration

echo "🔍 Finding your local IP addresses..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 MOBILE APP SETUP - LOCAL IP ADDRESSES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get all IPv4 addresses (excluding localhost)
IPS=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1')

if [ -z "$IPS" ]; then
    echo "❌ No network interfaces found"
    echo ""
    echo "Make sure you're connected to a network (WiFi or Ethernet)"
    exit 1
fi

echo "📡 Available Network Interfaces:"
echo ""

counter=1
primary_ip=""

while IFS= read -r ip; do
    # Determine if it's a local network IP
    if [[ $ip == 192.168.* ]] || [[ $ip == 10.* ]] || [[ $ip == 172.16.* ]]; then
        if [ -z "$primary_ip" ]; then
            primary_ip=$ip
            echo "   $counter. $ip  ⭐ (Primary - Use this for mobile)"
        else
            echo "   $counter. $ip"
        fi
    else
        echo "   $counter. $ip"
    fi
    ((counter++))
done <<< "$IPS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$primary_ip" ]; then
    PORT=${PORT:-4005}
    
    echo "✅ RECOMMENDED CONFIGURATION FOR FLUTTER:"
    echo ""
    echo "   Update your Flutter app's graphql_config.dart:"
    echo ""
    echo "   static const String _baseUrl = '$primary_ip:$PORT';"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 FULL GRAPHQL ENDPOINT:"
    echo ""
    echo "   HTTP URL:  http://$primary_ip:$PORT/api/graphql"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🧪 TEST CONNECTION FROM YOUR MOBILE DEVICE:"
    echo ""
    echo "   Make sure your mobile device is on the same WiFi network!"
    echo ""
    echo "   curl http://$primary_ip:$PORT/api/graphql \\"
    echo "     -X POST \\"
    echo "     -H \"Content-Type: application/json\" \\"
    echo "     -d '{\"query\":\"query { __typename }\"}'"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔥 START YOUR BACKEND SERVER:"
    echo ""
    echo "   npm run start:dev"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  FIREWALL REMINDER:"
    echo ""
    echo "   If connection fails, make sure port $PORT is open:"
    echo ""
    echo "   sudo ufw allow $PORT/tcp     # Ubuntu/Debian"
    echo "   sudo firewall-cmd --add-port=$PORT/tcp --permanent  # CentOS/RHEL"
    echo ""
else
    echo "⚠️  Could not determine primary IP address"
    echo ""
    echo "Please manually select an IP from the list above that starts with:"
    echo "  - 192.168.x.x (most common for home WiFi)"
    echo "  - 10.x.x.x    (some corporate networks)"
    echo "  - 172.16.x.x  (some networks)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 For detailed instructions, see: MOBILE_APP_INTEGRATION.md"
echo ""
