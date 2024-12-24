from flask import Blueprint, request, jsonify, current_app, send_from_directory
import os
from werkzeug.utils import secure_filename

api = Blueprint('api', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@api.route('/api/images', methods=['GET'])
def get_images():
    image_folder = current_app.config['UPLOAD_FOLDER']
    images = [filename for filename in os.listdir(image_folder) if allowed_file(filename)]
    return jsonify(images)


@api.route('/uploads/images/<filename>', methods=['GET'])
def serve_image(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@api.route('/api/upload', methods=['POST'])
def upload_images():
    if 'files' not in request.files:
        return jsonify({'error': 'No files uploaded'}), 400

    files = request.files.getlist('files')
    uploaded_files = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            uploaded_files.append(filename)

    return jsonify({'uploaded': uploaded_files})
