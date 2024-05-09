from flask import Flask, request, send_file, send_from_directory, render_template
from werkzeug.utils import secure_filename
import os
import format_convertor
import shutil
import datetime as dt
import zipfile

app = Flask(__name__)

# 设置上传文件的保存路径
UPLOAD_FOLDER = '/root/Format_Convertor/upload/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 设置生成文件的保存路径
PROCESSED_FOLDER = '/root/Format_Convertor/processed/'
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

@app.route('/')
def index():
    # 清空上传和生成文件夹
    if os.path.exists(UPLOAD_FOLDER):
        shutil.rmtree(UPLOAD_FOLDER)
    os.makedirs(UPLOAD_FOLDER)

    if os.path.exists(PROCESSED_FOLDER):
        shutil.rmtree(PROCESSED_FOLDER)
    os.makedirs(PROCESSED_FOLDER)
    
    return render_template('./index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files[]' not in request.files:
        return 'No file part'

    files = request.files.getlist('files[]')
    filename_list = []
    for file in files:
        if file.filename == '':
            return 'No selected file'
        if file:
            filename = secure_filename(file.filename)
            filename_list.append(filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

    # 处理上传的文件并生成Excel
    format_convertor.format_convertor(filename_list, read_path=app.config['UPLOAD_FOLDER'], save_path=app.config['PROCESSED_FOLDER'])
    
    # 提供打包下载链接
    zip_file_path = os.path.join(app.config['PROCESSED_FOLDER'], 'processed_files.zip')
    with zipfile.ZipFile(zip_file_path, 'w') as zipf:
        for root, dirs, processed_files in os.walk(app.config['PROCESSED_FOLDER']):
            for processed_file in processed_files:
                if processed_file != 'processed_files.zip':
                    zipf.write(os.path.join(root, processed_file), os.path.relpath(os.path.join(root, processed_file), app.config['PROCESSED_FOLDER']))
                    print(os.path.join(root, processed_file), os.path.relpath(os.path.join(root, processed_file), app.config['PROCESSED_FOLDER']))
    return send_file(zip_file_path, as_attachment=True)



if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=9090)
