FROM  jekyll/jekyll:4.2.0

WORKDIR /app

COPY . ./
COPY --chown=jekyll:jekyll Gemfile.lock Gemfile.lock

RUN yarn install \
    && gem install bundler \
    && bundle install \
    && mkdir .jekyll-cache _site \
    && JEKYLL_ENV=production jekyll build

EXPOSE 4000

CMD ["jekyll", "serve"]
