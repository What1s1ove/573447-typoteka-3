'use strict';

const {Router} = require(`express`);
const {getHttpErrors, asyncHandler} = require(`~/helpers`);
const {checkUserAuthenticate} = require(`~/middlewares`);
const {SsrPath, SsrArticlePath, ArticleKey} = require(`~/common/enums`);
const {getArticleData} = require(`./helpers`);

const initArticlesRouter = (app, settings) => {
  const articlesRouter = new Router();
  const {api, storage} = settings;

  app.use(SsrPath.ARTICLES, articlesRouter);

  articlesRouter.get(
      SsrArticlePath.EDIT_$ARTICLE_ID,
      checkUserAuthenticate,
      asyncHandler(async (req, res) => {
        const {id} = req.params;
        const [article, categories] = await Promise.all([
          api.getArticle(id),
          api.getCategories(),
        ]);

        return res.render(`pages/articles/edit`, {
          article,
          categories,
        });
      })
  );

  articlesRouter.get(
      SsrArticlePath.ADD,
      checkUserAuthenticate,
      asyncHandler(async (_req, res) => {
        const categories = await api.getCategories();

        return res.render(`pages/articles/edit`, {
          categories,
          article: {},
        });
      })
  );


  articlesRouter.post(
      SsrArticlePath.ADD,
      [checkUserAuthenticate, storage.upload.single(ArticleKey.IMAGE)],
      asyncHandler(async (req, res) => {
        const {body, file} = req;
        const articleData = getArticleData(body, file);

        try {
          await api.createArticle(articleData);

          return res.redirect(SsrPath.MY);
        } catch (err) {
          const categories = await api.getCategories();

          return res.render(`pages/articles/edit`, {
            categories,
            article: articleData,
            errorMessages: getHttpErrors(err),
          });
        }
      })
  );

  articlesRouter.post(
      SsrArticlePath.EDIT_$ARTICLE_ID,
      [checkUserAuthenticate, storage.upload.single(ArticleKey.IMAGE)],
      asyncHandler(async (req, res) => {
        const {body, file, params} = req;
        const {id} = params;
        const parsedId = Number(id);
        const articleData = getArticleData(body, file);

        try {
          await api.updateArticle(parsedId, articleData);

          return res.redirect(SsrPath.MY);
        } catch (err) {
          const article = await api.getArticle(parsedId);
          const categories = await api.getCategories();

          return res.render(`pages/articles/edit`, {
            categories,
            article: {
              ...article,
              ...articleData,
            },
            errorMessages: getHttpErrors(err),
          });
        }
      })
  );

  articlesRouter.get(
      SsrArticlePath.$ARTICLE_ID,
      asyncHandler(async (req, res) => {
        const {id} = req.params;
        const [article, categories] = await Promise.all([
          api.getArticle(id),
          api.getCategories(),
        ]);

        return res.render(`pages/articles/article`, {
          article,
          categories,
        });
      })
  );

  articlesRouter.get(
      SsrArticlePath.CATEGORY_$ARTICLE_ID,
      asyncHandler((_req, res) => {
        return res.render(`pages/articles/categories`, {
          title: `Типотека`,
          displayedTitle: `Бизнес`,
          description: `Это приветственный текст, который владелец блога может выбрать, чтобы описать себя 👏`,
          hasContent: true,
          hasHot: true,
          hasLastComments: true,
        });
      })
  );

  articlesRouter.post(
      [checkUserAuthenticate, SsrArticlePath.$ARTICLE_ID_COMMENT],
      asyncHandler(async (req, res) => {
        const {body, params} = req;
        const parsedComment = Number(params.id);
        const {comment} = body;

        try {
          await api.createComment(parsedComment, {
            text: comment,
          });

          return res.redirect(`${SsrPath.ARTICLES}/${parsedComment}`);
        } catch (err) {
          const categories = await api.getCategories();
          const article = await api.getArticle(parsedComment);

          return res.render(`pages/articles/article`, {
            article,
            comment,
            categories,
            errorMessages: getHttpErrors(err),
          });
        }
      })
  );
};

module.exports = {
  initArticlesRouter,
};
