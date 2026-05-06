#!/bin/bash
# LəçinSatış - Server Deployment Script
# Bu scripti serverdə işlədin (Ubuntu/Debian)

set -e

echo "=========================================="
echo "LəçinSatış Quraşdırma Scripti"
echo "=========================================="

# 1. Sistemi yenilə
echo "[1/7] Sistem yenilənir..."
apt update && apt upgrade -y

# 2. Python və pip quraşdır
echo "[2/7] Python quraşdırılır..."
apt install -y python3 python3-pip python3-venv

# 3. Layihə qovluğu yaradın
echo "[3/7] Qovluq yaradılır..."
mkdir -p /var/www/lacinsatis
cd /var/www/lacinsatis

# 4. Backend fayllarını kopyalayın (bu scriptlə birlikdə)
# Əgər faylları əl ilə atıbsınız, bu addımı atlayın
echo "[4/7] Fayllar hazırlanır..."
# cp -r backend/* /var/www/lacinsatis/

# 5. Virtual mühit yaradın
echo "[5/7] Virtual mühit yaradılır..."
python3 -m venv venv
source venv/bin/activate

# 6. Python kitabxanaları quraşdır
echo "[6/7] Kitabxanalar quraşdırılır..."
pip install --upgrade pip
pip install fastapi uvicorn[standard] qrcode[pil] pydantic

# 7. Backend-i test et
echo "[7/7] Backend test edilir..."
cd /var/www/lacinsatis
python3 -c "from main import app; print('OK - Backend hazırdır!')"

echo ""
echo "=========================================="
echo "Quraşdırma tamamlandı!"
echo ""
echo "İndi bunları edin:"
echo "1. Backend-i başladın: cd /var/www/lacinsatis && source venv/bin/activate && python main.py"
echo "2. Nginx quraşdırın: apt install nginx"
echo "3. nginx.conf faylını /etc/nginx/sites-available/lacinsatis kopyalayın"
echo "4. nginx aktiv edin: ln -s /etc/nginx/sites-available/lacinsatis /etc/nginx/sites-enabled/"
echo "5. nginx yenidən başladın: systemctl restart nginx"
echo "=========================================="