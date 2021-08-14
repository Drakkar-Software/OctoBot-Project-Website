FROM  jekyll/jekyll:4.2.0

WORKDIR /app

COPY . ./

EXPOSE 4000

CMD ["jekyll", "serve"]
