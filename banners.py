import requests
from bs4 import BeautifulSoup
import sqlite3

class Banners:
    def __init__(self):
        self.url = 'https://terraria.fandom.com/wiki/Banners_(enemy)'
        self.all_banners = []
        self.owned_banners = set()
        self.db_path = 'banners.db'
        self.initialise_database()
        self.update_banners()

    def initialise_database(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS owned_banners (
                       id TEXT PRIMARY KEY,
                       name TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def update_banners(self):
        banners = []
        get_url = requests.get(self.url)
        soup = BeautifulSoup(get_url.content, 'html.parser')
        for div in soup.find_all('div', class_ = 'id'):
            text= div.get_text(strip = True)
            if "Item ID" in text:
                banner_id = text.split(':')[-1].strip()

            parent = div.find_parent()
            if parent:
                title_tag = parent.find('a', title=True)
                if title_tag:
                    banner_name = title_tag['title']
                    banners.append({
                    'id': banner_id,
                    'name': banner_name 
                    })

        self.all_banners = banners
        return banners
    
    def get_banner_name(self, id):
        str_id = str(id)
        for item in self.all_banners:
            if item['id'] == str_id:
                return item['name']
    
    def get_owned_banners(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name FROM owned_banners
        ''')
        owned_banners = []
        for row in cursor.fetchall():
            owned_banners.append({"id": row[0], "name": row[1]})
        conn.close()
        return owned_banners
    
    def check_valid_banner(self, banner_id):
        banner_str = str(banner_id)
        valid_banner = False
        for banner in self.all_banners:
            if banner['id'] == banner_str:
                valid_banner = True
        return valid_banner
    
    def add_owned_banner(self, banner_id):
        if not self.all_banners:
            self.update_banners()
        valid_banner = self.check_valid_banner(banner_id)
        if valid_banner:
            banner_name = self.get_banner_name(banner_id)
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            try:
                cursor.execute('''
                    INSERT INTO owned_banners (id, name) VALUES (?, ?)''',
                    (banner_id, banner_name)
                )
                conn.commit()
                conn.close()
                return True
            except sqlite3.IntegrityError:
                conn.close()
                return False #Banner already exists
        return False #Invalid banner ID
    
    def get_progress(self):
        total = len(self.all_banners)
        owned = len(self.get_owned_banners())
        return {"progress": f"{owned}/{total}"}
            
if __name__ == '__main__':
    banners = Banners()
    print(banners.get_owned_banners())





