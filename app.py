from flask import Flask, jsonify, request, send_from_directory
from banners import Banners

app = Flask(__name__)
banners = Banners()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/banners', methods = ['GET'])
def get_all_banners():
    banners = banners.update_banners()
    return jsonify(banners)

@app.route('/api/owned_banners', methods = ['GET'])
def get_owned_banners():
    owned_banners = banners.get_owned_banners()
    print(owned_banners)
    return jsonify({'banners': owned_banners})

@app.route('/api/owned_banners', methods = ['POST'])
def add_owned_banner():
    banner_id = request.json.get('id')

    if not banner_id:
        return jsonify({'error': 'Missing "id" field'}), 400
    
    if banners.add_owned_banner(banner_id):
        return jsonify({'message': 'Banner added', 'owned': banners.get_owned_banners(), "count": len(banners.get_owned_banners())})
    else:
        return jsonify({'error': 'Invalid or duplicate banner ID'}), 400
    
@app.route('/api/progress', methods = ['GET'])
def get_progress():
    return jsonify(banners.get_progress())

@app.route('/api/search_banners', methods=['GET'])
def search_banners():
    query = request.args.get('query', '').lower()
    if not query:
        return jsonify([])
    
    results = []
    for banner in banners.all_banners:
        if query in banner['name'].lower() or query in banner['id']:
            results.append({'id': banner['id'], 'name': banner['name']})

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)