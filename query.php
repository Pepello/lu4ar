<?php

if(isset($_GET['request']) && $_GET['request'] !== ''){

    include('connection.php');

    if($_GET['request'] === 'get_typologies'){
        if(isset($_GET['is_agent']) && $_GET['is_agent'] !== ''){
            $query = 'SELECT * FROM Typologies WHERE is_agent = ' . $_GET['is_agent'];
            $result = $conn->query($query);

            if($result->num_rows > 0){
                while($row = $result->fetch_assoc()){
                    $img = explode('.', $row['img']);

                    $response[] = [
                        'type' => $row['type'],
                        'plr' => $row['preferred_lexical_reference'],
                        'alr' => explode(',', $row['alternative_lexical_references']),
                        'img' => [
                            'name' => $img[0],
                            'type' => $img[1]
                        ],
                        'slot' => (float)$row['slot'],
                        'states' => $row['states'] !== null ? explode(',', $row['states']) : null,
                    ];
                }
                echo json_encode($response, true);
            }
        }
    }

    if($_GET['request'] === 'get_maps'){
        $query = 'SELECT * FROM Maps';
        $result = $conn->query($query);

        if($result->num_rows > 0){
            while($row = $result->fetch_assoc()){

                $response[$row['id']] = $row;
            }
            echo json_encode($response, true);
        }
    }

    if($_GET['request'] === 'get_agent'){
        if(isset($_GET['map_id']) && $_GET['map_id'] !== ''){
            $query = 'SELECT * FROM Agents WHERE id = ' . $_GET['map_id'];
            $result = $conn->query($query);

            if($result->num_rows > 0){
                $row = $result->fetch_assoc();
                $response = [
                    'atom' => $row['atom'],
                    'type' => $row['type'],
                    'position' => [
                        'top' => (int)$row['y'],
                        'left' => (int)$row['x']
                    ]
                ];
                echo json_encode($response, true);
            }
        }
    }

    if($_GET['request'] === 'get_entities'){
        if(isset($_GET['map_id']) && $_GET['map_id'] !== ''){
            $query = 'SELECT atom, type, x, y FROM Entities WHERE map = ' . $_GET['map_id'];
            $result = $conn->query($query);

            if($result->num_rows > 0){
                while($row = $result->fetch_assoc()){
                    $response[] = [
                        'atom' => $row['atom'],
                        'type' => $row['type'],
                        'position' => [
                            'top' => (int)$row['y'],
                            'left' => (int)$row['x']
                        ]
                    ];
                }
                echo json_encode($response, true);
            }

        }

    }

    $conn->close();

}
