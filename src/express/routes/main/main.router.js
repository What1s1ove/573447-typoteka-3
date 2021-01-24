'use strict';

const {Router} = require(`express`);
const {SsrPath, SsrMainPath, UserKey} = require(`~/common/enums`);
const {getHttpErrors} = require(`~/helpers`);
const {
  ARTICLES_PER_PAGE,
  ARTICLES_SKIP_PAGE_COUNT,
} = require(`~/common/constants`);
const {getRegisterData} = require(`./helpers`);

const initMainRouter = (app, settings) => {
  const mainRouter = new Router();
  const {api, storage} = settings;

  app.use(SsrPath.MAIN, mainRouter);

  mainRouter.get(SsrMainPath.ROOT, async (req, res) => {
    const {page = 1} = req.query;
    const parsedPage = Number(page);
    const offset = (parsedPage - ARTICLES_SKIP_PAGE_COUNT) * ARTICLES_PER_PAGE;

    const [{count, articles}, categories] = await Promise.all([
      api.getPageArticles({
        limit: ARTICLES_PER_PAGE,
        offset,
      }),
      api.getCategories(),
    ]);
    const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);

    return res.render(`pages/main`, {
      totalPages,
      categories,
      previews: articles,
      page: parsedPage,
      title: `Типотека`,
      hiddenTitle: ` Главная страница личного блога Типотека`,
      description: `Это приветственный текст, который владелец блога может выбрать, чтобы описать себя 👏`,
      hasHot: true,
      hasLastComments: true,
    });
  });

  mainRouter.get(SsrMainPath.REGISTER, (_req, res) => {
    return res.render(`pages/register`, {
      registerPayload: {},
    });
  });

  mainRouter.post(
      SsrMainPath.REGISTER,
      storage.upload.single(UserKey.AVATAR),
      async (req, res) => {
        const {body, file} = req;
        const registerPayload = getRegisterData(body, file);

        try {
          await api.registerUser(registerPayload);

          return res.redirect(SsrMainPath.LOGIN);
        } catch (err) {
          return res.render(`pages/register`, {
            registerPayload,
            errorMessages: getHttpErrors(err),
          });
        }
      },
  );

  mainRouter.get(SsrMainPath.LOGIN, (_req, res) => {
    return res.render(`pages/login`, {
      title: `Типотека`,
    });
  });

  mainRouter.get(SsrMainPath.SEARCH, async (req, res) => {
    const {search} = req.query;
    const results = await api.search(search);

    return res.render(`pages/search`, {
      results,
      searchValue: search,
      title: `Типотека`,
      hiddenTitle: ` Страница поиска личного блога Типотека`,
    });
  });
};

module.exports = {
  initMainRouter,
};
