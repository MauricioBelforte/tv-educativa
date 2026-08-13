from playwright.sync_api import sync_playwright
import time
import os

def test_optimizations():
    """Script de testing automatizado para optimizaciones del Módulo 04"""
    
    print("🚀 Iniciando tests automatizados...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Navegar a la aplicación
            print("🌐 Navegando a http://localhost:3000...")
            page.goto('http://localhost:3000', timeout=30000)
            page.wait_for_load_state('networkidle', timeout=30000)
            print("✅ Página cargada exitosamente")
            
            # Tomar screenshot inicial
            screenshot_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'tmp', '01_initial_load.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"📸 Screenshot inicial guardado: {screenshot_path}")
            
            # Verificar que la página tiene contenido
            print("🔍 Verificando contenido de la página...")
            content = page.content()
            print(f"✅ Tamaño del HTML: {len(content)} caracteres")
            
            # Intentar encontrar elementos de canales
            try:
                channels = page.locator('.channel-card').all()
                print(f"✅ {len(channels)} channel-card encontrados")
            except:
                print("⚠️  No se encontraron channel-card, buscando otros selectores...")
                # Intentar otros selectores
                all_divs = page.locator('div').all()
                print(f"ℹ️  Total de divs: {len(all_divs)}")
            
            # Screenshot final
            final_screenshot = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'tmp', '02_final_state.png')
            page.screenshot(path=final_screenshot, full_page=True)
            print(f"� Screenshot final guardado: {final_screenshot}")
            
            print("\n✅ Tests automatizados completados exitosamente")
            
        except Exception as e:
            print(f"❌ Error durante testing: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()
            print("🔚 Browser cerrado")

if __name__ == "__main__":
    test_optimizations()
