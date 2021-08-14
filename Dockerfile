FROM  jekyll/jekyll:4.2.0

WORKDIR /app

COPY --chown=jekyll:jekyll . ./

RUN yarn install \
    && gem install bundler \
    && bundle install \
    && JEKYLL_ENV=production jekyll build

EXPOSE 4000

CMD ["jekyll", "serve"]
