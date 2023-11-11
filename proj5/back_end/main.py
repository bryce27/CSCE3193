from typing import Mapping, Any
import os
from http_daemon import delay_open_url, serve_pages
from typing import Dict, List, Tuple

class Player:
    def __init__(self, id:str) -> None:
        self.id = id
        self.name = ''
        self.x = 0
        self.y = 0
        self.what_i_know = 0 

players: Dict[str, Player] = {}
history: List[Tuple[str, str, int, int]] = []


def find_or_create_player(id:str) -> Any:

    if players.get(id) is None:
        new_player = Player(id)
        players[id] = new_player

        return new_player
    else:
        return players[id]
    

def ajax(req: Mapping[str, Any]) -> Mapping[str, Any]:

    if req['action'] == 'click':
        player = find_or_create_player(req['id'])
        player.x = req['x']
        player.y = req['y']
        player.name = req['name']

        history.append((player.id, player.name, player.x, player.y))

        return {
            'message': 'OK',
        }
    
    elif req['action'] == 'update': 
        if (len(history) == 0):
            return {
                'message': 'success',
                'updates': history
            }
        else:
            player = find_or_create_player(req['id'])
            what_they_knew = player.what_i_know
            player.what_i_know = len(history)

            return {
                'message': 'success',
                'updates': history[what_they_knew:player.what_i_know]
            }

    else:
        raise ValueError('we shouldnt be here')
    

def main() -> None:
    os.chdir(os.path.join(os.path.dirname(__file__), '../front_end'))

    # Routes
    port = 8987
    delay_open_url(f'http://localhost:{port}/game.html', .1)
    # delay_open_url(f'http://localhost:{port}/game.html', .2) # for second browser window
    serve_pages(port, { 
        'ajax': ajax,
    })


if __name__ == "__main__":
    main()
