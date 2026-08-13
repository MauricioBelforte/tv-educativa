from playwright.sync_api import sync_playwright
import os

print("Iniciando test simple...")
print(f"Directorio actual: {os.getcwd()}")

with sync_playwright() as p:
    print("Iniciando browser...")
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    try:
        print("Navegando a http://localhost:3000...")
        page.goto('http://localhost:3000', timeout=30000)
        print("Pagina cargada")

        print("Tomando screenshot...")
        page.screenshot(path='test_screenshot.png', full_page=True)
        print("Screenshot guardado: test_screenshot.png")

        print("Obteniendo titulo...")
        title = page.title()
        print(f"Titulo: {title}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()
        print("Browser cerrado")

print("Test completado")
