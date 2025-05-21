from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
import zipfile
from typing import List
import format_convertor as format_convertor
import logging
import traceback

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 确保文件夹路径是绝对路径
UPLOAD_FOLDER = os.path.abspath('upload')
PROCESSED_FOLDER = os.path.abspath('processed')

app = FastAPI()

# 允许跨域，便于本地开发
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务（如前端build产物）
if os.path.exists('frontend/build'):
    app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")

@app.post("/api/upload")
async def upload(files: List[UploadFile] = File(...)):
    try:
        logger.info(f"开始处理上传文件，文件数量: {len(files)}")

        # 确保文件夹存在
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(PROCESSED_FOLDER, exist_ok=True)

        # 清空文件夹
        for folder in [UPLOAD_FOLDER, PROCESSED_FOLDER]:
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    logger.error(f"清理文件夹时出错: {str(e)}")
                    return JSONResponse(
                        status_code=500,
                        content={"detail": f"清理文件夹时发生错误: {str(e)}"}
                    )

        filename_list = []
        for file in files:
            try:
                filename = file.filename
                logger.info(f"处理文件: {filename}")
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                with open(file_path, "wb") as f:
                    content = await file.read()
                    f.write(content)
                    logger.info(f"文件保存成功: {file_path}, 大小: {len(content)} bytes")
                filename_list.append(filename)
            except Exception as e:
                logger.error(f"保存文件时出错: {str(e)}")
                return JSONResponse(
                    status_code=500,
                    content={"detail": f"保存文件时发生错误: {str(e)}"}
                )

        try:
            logger.info(f"开始格式转换，文件列表: {filename_list}")
            format_convertor.format_convertor(filename_list, read_path=UPLOAD_FOLDER, save_path=PROCESSED_FOLDER)
            logger.info("格式转换完成")
        except Exception as e:
            logger.error(f"格式转换时出错: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"格式转换时发生错误: {str(e)}"}
            )

        try:
            zip_file_path = os.path.join(PROCESSED_FOLDER, 'processed_files.zip')
            with zipfile.ZipFile(zip_file_path, 'w') as zipf:
                for root, dirs, processed_files in os.walk(PROCESSED_FOLDER):
                    for processed_file in processed_files:
                        if processed_file != 'processed_files.zip':
                            file_path = os.path.join(root, processed_file)
                            archive_path = os.path.relpath(file_path, PROCESSED_FOLDER)
                            logger.info(f"添加到压缩包: {archive_path}")
                            zipf.write(file_path, archive_path)
            logger.info(f"压缩包创建成功: {zip_file_path}")
            return FileResponse(zip_file_path, filename='processed_files.zip', media_type='application/zip')
        except Exception as e:
            logger.error(f"创建压缩包时出错: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"创建压缩包时发生错误: {str(e)}"}
            )
    except Exception as e:
        logger.error(f"处理过程中发生错误: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": f"后端处理异常: {str(e)}"}
        )
