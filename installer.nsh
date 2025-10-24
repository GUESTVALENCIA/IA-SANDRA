; ═══════════════════════════════════════════════════════════════
; SANDRA MCP PROFESSIONAL - INSTALLER CUSTOMIZATION
; CEO: Claytis Miguel Tom Zuaznabar | GuestsValencia
; ═══════════════════════════════════════════════════════════════

!macro customInit
  ; Verificar que no hay otra instancia ejecutándose
  System::Call 'kernel32::CreateMutex(i 0, i 0, t "SandraMCPProfessionalMutex") i .r1 ?e'
  Pop $R0
  ${If} $R0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "Sandra MCP Professional ya está ejecutándose. Cierre la aplicación antes de continuar con la instalación."
    Abort
  ${EndIf}
!macroend

!macro customInstall
  ; Crear acceso directo en el escritorio
  CreateShortcut "$DESKTOP\Sandra MCP Professional.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\resources\app\assets\sandra-icon.ico"

  ; Registrar la aplicación en el sistema
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayName" "Sandra MCP Professional"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "Publisher" "GuestsValencia"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayIcon" "$INSTDIR\resources\app\assets\sandra-icon.ico"
!macroend

!macro customUnInit
  ; Limpiar registros y accesos directos
  Delete "$DESKTOP\Sandra MCP Professional.lnk"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
!macroend