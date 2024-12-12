FROM python:3.10.4
COPY . /format_conv
WORKDIR /format_conv
RUN pip install flask==3.0.3 openpyxl==3.0.9 pandas==1.4.2 werkzeug==3.0.3 numpy==1.22.3
EXPOSE 80
CMD python ./main.py
