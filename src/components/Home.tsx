import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import CircularProgress from "@mui/joy/CircularProgress";
import { Item } from "./interfaces";
import { BASE_URL } from "./constants";

const Home = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [list, setList] = useState<Item[]>([]);

  const compare = (a: Item, b: Item) => {
    if (a.time < b.time) {
      return -1;
    }
    if (a.time > b.time) {
      return 1;
    }
    return 0;
  };

  const fetchArticles = async () => {
    setIsLoading(true);

    const articleIds = await axios.get(`${BASE_URL}/newstories.json`);
    const articlePromises = articleIds.data
      .slice(0, 100)
      .map(async (articleId: number) => {
        const article = await axios.get(`${BASE_URL}/item/${articleId}.json`);
        return article.data;
      });
    const articleList: Item[] = await Promise.all(articlePromises);
    setList(articleList.sort(compare));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  setInterval(() => fetchArticles(), 60000);

  return (
    <Fragment>
      <h2 className="Header">Hacker News</h2>
      <Button
        onClick={fetchArticles}
        className="UpdListBtn"
        endIcon={
          isLoading && (
            <CircularProgress
              color="warning"
              determinate={false}
              value={25}
              variant="soft"
              size="sm"
              thickness={2}
            />
          )
        }
        disabled={isLoading}
      >
        Update
      </Button>
      <List>
        {list.map((article) => (
          <ListItem key={article.id}>
            <Link
              to={article.id.toString()}
              state={{ article: article }}
              className="ArticleItemListLink"
            >
              <ListItemText
                primary={article.title}
                secondary={`${article.score} points by ${article.by} | ${moment(
                  article.time
                ).format("MMM Do YY")} | ${article.descendants} comments`}
              />
            </Link>
          </ListItem>
        ))}
      </List>
    </Fragment>
  );
};

export default Home;
