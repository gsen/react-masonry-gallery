import { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import './App.css';

// const useStyles = makeStyles((theme) => ({
//   container: {
//     margin: '0 5%',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   masonryRoot: {
//     display: 'flex',
//     flexDirection: 'column',
//     flexWrap: 'wrap',

//   },
//   masonryCell: {
//     flex: 1,
//     margin: '4px'
//   },
//   masonryItem: {
//     background: '#EC985A',
//     color: 'white',
//     margin: '4px',
//     textAlign: 'center',
//     fontFamily: 'system-ui',
//     fontWeight: '900',
//     fontSize: '32px',
//   },
//   paper: {
//     padding: theme.spacing(2),
//     textAlign: 'center',
//     color: theme.palette.text.secondary,
//   },
// }));

function App() {
  const [images, setImages] = useState([]);
  const [visible, setVisibile] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const result = await fetch('http://www.hyhaus.xyz/api/photos');
      const json = await result.json();
      setImages(json);
    }
    loadImages();
  }, [])

  const masonryRoot = useRef(null)
  let number = 1;
  let roots;
  const minColWidth = 236;
  const onResize = () => {
    for (let root of roots) {

      // only layout when the number of columns has changed
      let newNoOfColumns = Math.floor(root.element.offsetWidth / minColWidth);
      if (newNoOfColumns != root.noOfColumns) {

        // initialize
        root.noOfColumns = newNoOfColumns;
        let columns = Array.from(new Array(root.noOfColumns)).map(function (column) {
          return {
            'cells': new Array(),
            'outerHeight': 0
          };
        });

        // divide...
        for (let cell of root.cells) {
          let minOuterHeight = Math.min(...columns.map(function (column) {
            return column.outerHeight;
          }));
          let column = columns.find(function (column) {
            return column.outerHeight == minOuterHeight;
          });
          column.cells.push(cell);
          column.outerHeight += cell.outerHeight;
        }

        // calculate masonry height
        let masonryHeight = Math.max(...columns.map(function (column) {
          return column.outerHeight;
        }));

        // ...and conquer
        let order = 0;
        for (let column of columns) {
          for (let cell of column.cells) {
            cell.element.style.order = order++;
            // set the cell's flex-basis to 0
            cell.element.style.flexBasis = 0;
          }
          // set flex-basis of the last cell to fill the
          // leftover space at the bottom of the column
          // to prevent the first cell of the next column
          // to be rendered at the bottom of this column
          column.cells[column.cells.length - 1].element.style.flexBasis = column.cells[column.cells.length - 1].element.offsetHeight + masonryHeight - column.outerHeight - 1 + 'px';
        }

        // set the masonry height to trigger
        // re-rendering of all cells over columns
        // one pixel more than the tallest column
        root.element.style.maxHeight = masonryHeight + 1 + 'px';
        setVisibile(true);

        console.log(columns.map(function (column) {
          return column.outerHeight;
        }));
        console.log(root.element.style.maxHeight);
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      
      let cellElements = masonryRoot.current.getElementsByClassName('masonry-cell');
      let cells = Array.prototype.map.call(cellElements, function (cellElement) {
        let style = getComputedStyle(cellElement);
        return {
          'element': cellElement,
          'outerHeight': parseInt(style.marginTop) + cellElement.offsetHeight + parseInt(style.marginBottom)
        };
      });
      roots = [{
        'element': masonryRoot.current,
        'noOfColumns': 0,
        'cells': cells
      }];
      if (roots[0]?.cells?.length > 0) {
  
        onResize();
      }
    }, 800); // addding a delay so that images are rendered. Get correct height for calculation 
  }, [images])

  // useEffect(() => {

  //   // set resize listener
  //   window.addEventListener('resize', onResize);

  //   // clean up function
  //   return () => {
  //     // remove resize listener
  //     window.removeEventListener('resize', onResize);
  //   }
  // }, [])


  //   author: "Kale  Schmeler"
  // authorImage: "https://dvqlxo2m2q99q.cloudfront.net/000_clients/765709/page/7657092wn7T1x2.jpg"
  // city: "shanghai"
  // image: "https://petapixel.com/assets/uploads/2020/02/AndreaDavid1stWalk-31-Edit-800x534.jpg"
  // title: "Portrait 1"
  // __v: 0
  // _id: "5fe9d0ba19a7e42e370e678f"


  return (


    <Grid style={{visibility: visible? 'visible':'hidden'}} ref={masonryRoot} className="masonry-root" container>
      {

       images?.length>0 && images.map((image) => {
          // let height = Math.ceil((Math.random() * 100 + minColWidth + 64)) + 'px';

          return (<Grid className="masonry-cell" item key={number}>
            <Paper className="masonry-item">
              <div className="card-image">
                <img src={image.image} ></img>
              </div>
              <div className="author-desc">
                <img className="author-image" src={image.authorImage}></img>
                <span>{image.author}</span>
              </div>
            </Paper>
          </Grid>)

        })
      }
    </Grid>
  );
}

export default App;
