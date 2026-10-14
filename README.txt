SYSTEM AWAKENING — BETA 1.5
=============================

ARQUIVOS
- index.html
- style.css
- app.js
- manifest.json
- service-worker.js
- icon-512.png

IMPORTANTE
1. Para funcionar como PWA instalável/offline, hospede por HTTPS (Netlify ou GitHub Pages).
2. Extraia o ZIP e envie o CONTEÚDO da pasta (index.html, style.css etc.) para o serviço de hospedagem.
3. Não proteja o site com senha. No Netlify, Visitor access / Site visibility deve permitir acesso público.
4. Dados salvos em localStorage ficam apenas neste navegador/dispositivo. Limpar dados do navegador pode apagá-los. Use Exportar backup.
5. Esta é uma versão beta de teste; confira as funções antes de confiar nela para registrar seu progresso.

FUNCIONALIDADES
- Status do jogador, rank, nível, XP e moedas
- Missões diárias com XP
- Missão leve opcional de recuperação, sem punição física automática
- Cronômetro e checklist de treino em casa
- Registro e gráfico de peso
- Calculadora aproximada de gasto energético para adultos; bloqueia cálculo para menores de 18 anos
- Loja de recompensas personalizada
- Exportar backup JSON
- PWA com service worker e cache offline

INSTALAÇÃO ANDROID
1. Hospede publicamente em HTTPS.
2. Abra o URL no Chrome Android.
3. Menu ⋮ > Instalar app (ou Adicionar à tela inicial).
4. Abra o ícone criado. Na primeira abertura, carregue a página com internet para preparar o cache offline.

OBSERVAÇÃO
O cache offline cobre os arquivos principais. Recursos que dependem de hospedagem/primeiro carregamento podem não funcionar até a primeira visita online.
