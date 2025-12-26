@echo off
echo ========================================
echo LIBERANDO PORTA 3000 NO FIREWALL
echo ========================================
echo.
echo Este script vai adicionar uma regra no Firewall do Windows
echo para permitir que seu celular acesse o servidor Next.js
echo.
pause

netsh advfirewall firewall add rule name="Next.js Dev Server" dir=in action=allow protocol=TCP localport=3000

echo.
echo ========================================
if %errorlevel% == 0 (
    echo SUCESSO! Porta 3000 liberada!
    echo Agora tente acessar do celular:
    echo http://192.168.0.19:3000
) else (
    echo ERRO! Execute este arquivo como Administrador
    echo Clique com botao direito e escolha "Executar como Administrador"
)
echo ========================================
echo.
pause

