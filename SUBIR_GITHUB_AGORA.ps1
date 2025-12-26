# Script para subir tudo para GitHub
# Conta: ilucasmacedo/receita-facil

Write-Host "=== SUBINDO PROJETO PARA GITHUB ===" -ForegroundColor Green
Write-Host ""

# Tentar encontrar Git do GitHub Desktop
$gitPaths = @(
    "$env:LOCALAPPDATA\GitHubDesktop\resources\app\git\cmd\git.exe",
    "$env:ProgramFiles\Git\cmd\git.exe",
    "$env:ProgramFiles\Git\bin\git.exe",
    "$env:ProgramFiles(x86)\Git\cmd\git.exe",
    "$env:ProgramFiles(x86)\Git\bin\git.exe"
)

$gitExe = $null
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitExe = $path
        $env:PATH = "$(Split-Path $path);$env:PATH"
        Write-Host "Git encontrado: $path" -ForegroundColor Green
        break
    }
}

if (-not $gitExe) {
    Write-Host "Tentando usar Git do PATH..." -ForegroundColor Yellow
    try {
        $version = & git --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $gitExe = "git"
            Write-Host "Git encontrado no PATH" -ForegroundColor Green
        }
    } catch {
        Write-Host "ERRO: Git nao encontrado!" -ForegroundColor Red
        Write-Host "Por favor, use o GitHub Desktop:" -ForegroundColor Yellow
        Write-Host "1. Repository -> Open in Git Bash" -ForegroundColor Yellow
        Write-Host "2. Execute os comandos manualmente" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "1. Inicializando repositorio Git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "   Repositorio ja existe" -ForegroundColor Yellow
} else {
    & git init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK - Repositorio inicializado" -ForegroundColor Green
    } else {
        Write-Host "   ERRO ao inicializar" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "2. Configurando remote..." -ForegroundColor Cyan
$currentRemote = & git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Remote atual: $currentRemote" -ForegroundColor Yellow
    if ($currentRemote -notlike "*ilucasmacedo*") {
        Write-Host "   Removendo remote antigo..." -ForegroundColor Yellow
        & git remote remove origin
    }
}

$newRemote = "https://github.com/ilucasmacedo/receita-facil.git"
$checkRemote = & git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    & git remote add origin $newRemote
    Write-Host "   OK - Remote configurado: $newRemote" -ForegroundColor Green
} else {
    $existing = & git remote get-url origin
    if ($existing -ne $newRemote) {
        & git remote set-url origin $newRemote
        Write-Host "   OK - Remote atualizado: $newRemote" -ForegroundColor Green
    } else {
        Write-Host "   OK - Remote ja esta correto" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. Adicionando arquivos..." -ForegroundColor Cyan
& git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK - Arquivos adicionados" -ForegroundColor Green
} else {
    Write-Host "   ERRO ao adicionar arquivos" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "4. Verificando status..." -ForegroundColor Cyan
$status = & git status --short
if ($status) {
    Write-Host "   Arquivos para commitar encontrados" -ForegroundColor Green
} else {
    Write-Host "   Nenhuma mudanca para commitar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. Fazendo commit..." -ForegroundColor Cyan
$commitMsg = "feat: Receita Facil - Sistema completo de gestao de receitas e precificacao"
& git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK - Commit realizado" -ForegroundColor Green
} else {
    Write-Host "   AVISO: Nada para commitar ou commit ja existe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "6. Configurando branch main..." -ForegroundColor Cyan
& git branch -M main
Write-Host "   OK - Branch configurada" -ForegroundColor Green

Write-Host ""
Write-Host "=== CONFIGURACAO CONCLUIDA ===" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Yellow
Write-Host "Execute no GitHub Desktop ou terminal:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU use o GitHub Desktop:" -ForegroundColor Yellow
Write-Host "1. Clique em 'Publish branch' ou 'Push origin'" -ForegroundColor White
Write-Host "2. Se pedir credenciais:" -ForegroundColor White
Write-Host "   - Usuario: ilucasmacedo" -ForegroundColor White
Write-Host "   - Senha: Seu Personal Access Token" -ForegroundColor White
Write-Host ""

