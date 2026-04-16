cd /workspaces/Pneumonia-Detection-Webapp-Project/frontend

if [ ! -f .env ]; then
cat > .env <<'EOF'
VITE_API_BASE_URL=http://127.0.0.1:5000/api
VITE_API_URL=http://127.0.0.1:5000/api
EOF
fi

npm install
npm run dev -- --host 0.0.0.0 --port 5173
