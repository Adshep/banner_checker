import tkinter as tk
from tkinter import messagebox
import sqlite3

def insert_banner():
    banner_name = enter_banner.get().strip()
    if not banner_name:
        messagebox.showerror("Error", "Banner can't be empty!")
        return
    conn = sqlite3.connect('banners.db')
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS banners
                   (banner TEXT UNIQUE)''')
    
    try:
        cursor.execute('INSERT INTO banners (banner) VALUES (?)', (banner_name,))
        conn.commit()
        messagebox.showinfo("Success", f"'{banner_name}' has been added to the database.")

    except sqlite3.IntegrityError:
        messagebox.showerror("Error", f"'{banner_name}' has already been collected.")

    finally:
        conn.close()
    
window = tk.Tk()
window.title("Banner Checker")
window.geometry('200x200')
window.resizable(height=False, width=False)
banner_text = tk.Label(window, text= "Enter Banner Name:")
enter_banner = tk.Entry(window)
enter_button = tk.Button(window, text = "Submit/Check Banner", command=insert_banner)

banner_text.pack()
enter_banner.pack()
enter_button.pack()
window.mainloop()