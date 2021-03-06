import React from 'react';
import {Cell, ChainName, Order, Props, Tile} from './types';
import {highlightCell, move, unhighlightCell} from './actions';

export default ({model: {game}, dispatch}: Props) => {
    switch (game.type) {
        case 'PlayGame':
            return <div id="game-board">
                <div className="player">
                    <h1>Player's Hand</h1>
                    <span className="cash">{game.player.ownedCash}</span>
                    <div className="stock">{game.player.ownedStock.toList().map(displayStock)}</div>
                </div>
                <div className="moves">
                    <h1>Possible Moves</h1>
                    {game.possibleMoves.map((move, index) => displayMove(dispatch, move, index))}
                </div>
                <div className="board">
                    <h1>Current Board</h1>
                    {game.board.toList().map(cell => displayCell(cell, game.highlightedCell))}
                </div>
            </div>;
    }
    return null;
}

function displayStock({key, value}: { key: ChainName, value: number }) {
    return <span className={key}>
        <span className="stock-count">{value}</span>
    </span>;
}

function displayMove(dispatch:any, order: Order, n: number) {
    switch (order.tag) {
        case 'Place':
            return <span className="cell empty"
                         onClick={() => dispatch(move(n + 1))}
                         onMouseEnter={() => dispatch(highlightCell(order.tile))}
                         onMouseLeave={() => dispatch(unhighlightCell())}
            >
            <span className="cell-content">
                <span>{order.tile.row + '-' + order.tile.col}</span></span>
        </span>;

        case 'BuyStock':
            return <span className={'cell chain ' + order.chainName}
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className="fa fa-lg fa-usd"></span></span></span>;

        case 'SellStock':
            return <span className={'cell chain ' + order.chainName}
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className="fa fa-lg fa-usd"></span></span></span>;

        case 'ExchangeStock':
            return <span className="cell exchange"
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className={'buyee-' + order.fromChain}></span>
                    <span className={'buyer-' + order.toChain}></span>
                    <span className="fa fa-lg fa-exchange"></span>
                </span>
            </span>;

        case 'Fund':
            return <span className={'cell chain ' + order.chainName}
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className="fa fa-lg fa-building-o"></span>
                </span>
            </span>;

        case 'Merge':
            return <span className="cell merge"
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className={'buyee-' + order.fromChain}></span>
                    <span className={'buyer-' + order.toChain}></span>
                    <span className="fa fa-lg fa-building-o"></span>
                </span>
            </span>;

        case 'Pass':
            return <span className="cell"
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className="fa fa-lg fa-refresh"></span>
                </span>
            </span>;

        case 'EndGame':
            return <span className="cell"
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className="fa fa-lg fa-stop"></span>
                </span>
            </span>;

        case 'Cancel':
            return <span className="cell"
                         onClick={() => dispatch(move(n + 1))}>
                <span className="cell-content">
                    <span className="fa fa-lg fa-backward"></span>
                </span>
            </span>;
    }
}


function displayCell({key: tile, value: cell}: { key: Tile, value: Cell }, highlightedCell?: Tile) {

    function t2s(tile:Tile):string {
        return tile.row + "-" + tile.col;
    }

    function cellClass(cell:Cell, tile:Tile, highlightedCell?:Tile): string {
        switch (cell.cellContent.tag) {
            case 'Empty':
                return highlightedCell
                && highlightedCell.row === tile.row
                && highlightedCell.col === tile.col ? "highlighted" : "empty";

            case 'Neutral':
                return "neutral";

            case 'Chain':
                return cell.cellContent.contents;
        }
        return '';
    }

    return <span className={'cell ' + cellClass(cell, tile, highlightedCell)}>
                    <span className="cell-content">
                        <span>{t2s(tile)}</span></span></span>;
}

/*

gameBoard : Model -> Html Msg
gameBoard model =
    case model.game of
        PlayGame g ->
            div [ id "game-board" ]
                [ div [ class "player" ]
                    [ h1 [] [ text "Player's Hand" ]
                    , span [ class "cash" ] [ text <| toString g.player.ownedCash ]
                    , div [ class "stock" ] <| List.map displayStock (Dict.toList g.player.ownedStock)
                    ]
                , div [ class "plays" ]
                    (h1 [] [ text "Possible Plays" ] :: (List.indexedMap displayPlay g.possiblePlays))
                , div [ class "board" ]
                    (h1 [] [ text "Current Board" ] :: List.map (displayCell g.highlightedCell) (Dict.toList g.board))
                ]

        _ ->
            text ""


displayStock : ( ChainName, Int ) -> Html Msg
displayStock ( cn, num ) =
    span [ class cn ]
        [ span [ class "stock-count" ] [ text <| toString num ]
        ]


displayPlay : Int -> Messages.Order -> Html Msg
displayPlay n order =
    case order of
        Place _ ( r, c ) ->
            span
                [ class "cell empty"
                , onClick <| Play (n + 1)
                , onMouseEnter (HighlightCell ( r, c ))
                , onMouseLeave UnhighlightCell
                ]
                [ span [ class "cell-content" ]
                    [ span [] [ text <| String.fromChar r ++ "-" ++ toString c ] ]
                ]

        BuyStock _ cn ->
            span [ class <| "cell chain " ++ cn, onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class "fa fa-lg fa-usd" ] [] ]
                ]

        SellStock _ cn num price ->
            span [ class <| "cell chain " ++ cn, onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class "fa fa-lg fa-usd" ] [] ]
                ]

        ExchangeStock _ cf ct count ->
            span [ class <| "cell exchange", onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class <| "buyee-" ++ cf ] []
                    , span [ class <| "buyer-" ++ ct ] []
                    , span [ class "fa fa-lg fa-exchange" ] []
                    ]
                ]

        Fund _ cn _ ->
            span [ class <| "cell chain " ++ cn, onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class "fa fa-lg fa-building-o" ] [] ]
                ]

        Merge _ _ cf ct ->
            span [ class <| "cell merge", onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class <| "buyee-" ++ cf ] []
                    , span [ class <| "buyer-" ++ ct ] []
                    , span [ class "fa fa-lg fa-building-o" ] []
                    ]
                ]

        Pass ->
            span [ class <| "cell", onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class "fa fa-lg fa-refresh" ] [] ]
                ]

        EndGame ->
            span [ class <| "cell", onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class "fa fa-lg fa-stop" ] [] ]
                ]

        Cancel ->
            span [ class <| "cell", onClick <| Play (n + 1) ]
                [ span [ class "cell-content" ]
                    [ span [ class "fa fa-lg fa-backward" ] [] ]
                ]


displayCell : Maybe Tile -> ( Tile, Cell ) -> Html Msg
displayCell highlighted ( ( r, c ) as tile, cell ) =
    let
        hlClass =
            maybe " empty"
                (\hlTile ->
                    if hlTile == tile then
                        " highlighted"
                    else
                        " empty"
                )
                highlighted
    in
        case cell.cellContent of
            Empty ->
                span [ class <| "cell" ++ hlClass ]
                    [ span [ class "cell-content" ]
                        [ span [] [ text <| String.fromChar r ++ "-" ++ toString c ] ]
                    ]

            Neutral _ ->
                span [ class <| "cell neutral" ]
                    [ span [ class "cell-content" ]
                        [ span [] [ text <| String.fromChar r ++ "-" ++ toString c ] ]
                    ]

            Chain n ->
                span [ class <| "cell chain " ++ n ]
                    [ span [ class "cell-content" ]
                        [ span [] [ text <| String.fromChar r ++ "-" ++ toString c ] ]
                    ]

            _ ->
                text ""


 */
