import React, { Fragment, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Button, Card, CardContent, CardHeader } from "@mui/material";
import { TreeItem, TreeView } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CircularProgress from "@mui/joy/CircularProgress";
import { Item } from "./interfaces";
import { BASE_URL } from "./constants";

function ArticlePreview() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [article, setArticle] = useState<Item>(location.state.article);
  const [comments, setComments] = useState<Item[]>([]);
  const id = location.state.article.id;

  const fetchComments = async (commentsIds: number[], commentsSet: any) => {
    for (let i = 0; i < commentsIds.length; i++) {
      const response = await axios.get(
        `${BASE_URL}/item/${commentsIds[i]}.json`
      );
      const comment = response.data;
      commentsSet.add(commentsIds[i]);

      if (comment.kids) {
        await fetchComments(comment.kids, commentsSet);
      }
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const response = await axios.get(`${BASE_URL}/item/${id}.json`);
    setArticle(response.data);

    const commentsIds = [...(article.kids || [])];
    const commentsSet = new Set(commentsIds);

    await fetchComments(commentsIds, commentsSet);

    const commentsArray = Array.from(commentsSet);
    const commentsResponse = await axios.all(
      commentsArray.map((commentId) => {
        return axios.get(`${BASE_URL}/item/${commentId}.json`);
      })
    );

    const commentsData = commentsResponse.map((comment) => comment.data);
    setComments(commentsData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const commentsTree = (parentNews: Item) => {
    return comments
      .filter((comment) => comment.parent === parentNews.id)
      .map((comment) => {
        return (
          <TreeItem
            key={comment.id}
            nodeId={comment.id.toString()}
            label={`${comment.by}: ${comment.text}`}
            className="CommentTreeItem"
          >
            {comment.kids && commentsTree(comment)}
          </TreeItem>
        );
      });
  };

  return (
    <Fragment>
      <Button>
        <Link className="BackBtn" to="/">
          Back
        </Link>
      </Button>
      <Card className="Card">
        <CardHeader title={article.title} />
        <CardContent>
          {article.url && (
            <Link to={article.url} className="ArticleLink">
              {article.url}
            </Link>
          )}
        </CardContent>
        <CardContent>
          By {article.by} | {moment(article.time).format("MMM Do YY")} |{" "}
          {article.descendants} comments
        </CardContent>
        <CardContent>
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            <div>
              <Button
                className="UpdCommentsButton"
                onClick={() => fetchData()}
                startIcon={
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
              <h3>Comments:</h3>
              {article.descendants ? (
                commentsTree(article)
              ) : (
                <h4>No comments yet</h4>
              )}
            </div>
          </TreeView>
        </CardContent>
      </Card>
    </Fragment>
  );
}

export default ArticlePreview;
