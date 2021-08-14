FROM  jekyll/jekyll:4.2.0

WORKDIR /app

COPY . ./
RUN yarn install \
    && gem install bundler \
    && bundle install \
    && chmod -R u+rwx . \
    && JEKYLL_ENV=production jekyll build

EXPOSE 4000

CMD ["jekyll", "serve"]
